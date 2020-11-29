import React, {PureComponent} from 'react';
import Config from 'react-native-config';
// import Clipboard from '@react-native-community/clipboard';
import AsyncStorage from '@react-native-community/async-storage';
import {firebase} from '@react-native-firebase/messaging';
import {WebView} from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import Pdf from 'react-native-pdf';
import FileViewer from 'react-native-file-viewer';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Linking,
  Alert,
  Modal,
  SafeAreaView
} from 'react-native';

import {
  requestNotifications,
  request,
  PERMISSIONS,
} from 'react-native-permissions';

import { subscribeToken, unsubscribeToken } from './src/http/services/configurePushService';
import { download } from './src/utils/download';
import NavigationBar from './src/components/NavigationBar';
import DownloadBar from './src/components/DownloadBar';
import setupScript from './scripts/setup';

const BASE_URL = Config.BASE_URL;

export default class App extends PureComponent {
  state = {
    url: BASE_URL,
    isLoading: false,
    token: 'none',
    pdfSource: null,
    data: null,
    previewSource: null,
  };
  async componentDidMount() {
    //Permissions request
    await requestNotifications(['alert', 'badge', 'sound']);

    firebase
      .messaging()
      .requestPermission()
      .then(value => {
        firebase
          .messaging()
          .getToken()
          .then(token => {
            console.log(token);
            this.setState({token})
          });
      });
  }

  checkPermission() {
    return firebase
      .messaging()
      .hasPermission()
      .then(enabled => {
        if (enabled) {
          console.log('Permission granted');
          return this.getToken();
        } else {
          console.log('Request Permission');
          return this.requestPermission();
        }
      })
      .catch(err => console.log(err));
  }

  requestPermission() {
    return firebase
      .messaging()
      .requestPermission()
      .then(() => {
        return this.getToken();
      })
      .catch(error => {
        console.log('permission rejected');
      });
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        console.log('after fcmToken: ', fcmToken);
        this.setState({token: fcmToken});
        await AsyncStorage.setItem('fcmToken', fcmToken);
        return fcmToken;
      }
    } else {
      return fcmToken;
    }
  }

  onMessage = async ({nativeEvent}) => {
    const data = JSON.parse(nativeEvent.data);
    const token = await this.checkPermission();
    console.log('onMessage');
    switch (data.type) {
      case 'login':
        console.log('login');
        subscribeToken(token, data.authorization);
        break;
      case 'logout':
        console.log('logout');
        unsubscribeToken(data.authorization);
        break;
      case 'meeting':
        if (Platform.OS === 'android') {
          request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(result => {
            RNFetchBlob.config({
              path: `${RNFetchBlob.fs.dirs.DownloadDir}/sb-event-${data.eventId}.ics`,
              addAndroidDownloads: {
                notification: true,
                mediaScannable: true,
                mime: 'text/calendar',
                description: 'File downloaded by download manager.',
                title: `sb-event-${data.eventId}.ics`,
              },
            })
              .fetch('GET', data.url, {
                Authorization: 'Bearer ' + data.token,
              })
              .then(res => {
                if (res && res.path()) {
                  Alert.alert(`Download Success !`);
                }
              })
              .catch((errorMessage, statusCode) => {
                Alert.alert(`Something went wrong !`);
              });
          });
        } else {
          RNFetchBlob.config({
            fileCache: true,
            path:
              RNFetchBlob.fs.dirs.DocumentDir + `/sb-event-${data.eventId}.ics`,
          })
            .fetch('GET', data.url, {
              Authorization: 'Bearer ' + data.token,
            })
            .then(async res => {
              // the temp file path
              if (res && res.path()) {
                const filePath = res.path();
                let options = {
                  type: 'application/ics',
                  url: filePath,
                };
                await Share.open(options);
                await RNFS.unlink(filePath);
              }
            });
        }
        break;
      case 'file_download':
        this.setState({data});
        download(data, () => {});

        break;
      case 'pdf':
        this.setState({
          pdfSource: {
            uri: data.path,
            headers: {
              Authorization: 'Bearer ' + data.token,
              responseType: 'blob',
            },
          },
          data,
        });
        break;
      case 'preview':
        if (Platform.OS === 'ios') {
          this.setState({
            previewSource: {
              uri: data.path,
            },
            data,
          });
        } else {
          Alert.alert(
            'Preview or download the file?',
            '',
            [
              {
                text: 'Preview',
                onPress: () => {
                  const url = data.path;

                  const localFile = `${RNFS.DocumentDirectoryPath}/${data.file}`;

                  const options = {
                    fromUrl: url,
                    toFile: localFile,
                  };
                  RNFS.downloadFile(options)
                    .promise.then(() => FileViewer.open(localFile))
                    .then(() => null)
                    .catch(error => {
                      if (
                        error
                          .toString()
                          .includes('No app associated with this mime type')
                      ) {
                        Alert.alert(
                          'You have no app associateed with this type of file',
                        );
                      }
                    });
                },
              },
              {
                text: 'Download',
                onPress: () => download(data),
              },
            ],
            {
              cancelable: true,
            },
          );
        }
    }
  };

  render() {

    return (
      <SafeAreaView style={styles.container}>
        {this.state.isLoading && <ActivityIndicator />}
        {this.state.pdfSource && (
          <Modal visible animationType="slide">
            <Pdf style={{flex: 1}} source={this.state.pdfSource} />
            <DownloadBar
              goBack={() =>
                this.setState({
                  pdfSource: null,
                  data: null,
                })
              }
              data={this.state.data}
            />
          </Modal>
        )}
        {this.state.previewSource && Platform.OS === 'ios' && (
          <Modal visible animationType="slide">
            <WebView
              useWebKit
              style={{paddingTop: 30, flex: 1, opacity: 0.99}}
              source={{uri: this.state.previewSource.uri}}
            />
            <DownloadBar
              goBack={() => {
                this.setState({
                  previewSource: null,
                  data: null,
                });
              }}
              data={this.state.data}
            />
          </Modal>
        )}
        <WebView
          allowsFullscreenVideo
          key={1}
          source={{uri: this.state.url}}
          ref={ref => {
            this.webView = ref;
          }}
          style={styles.webView, {opacity: 0.99}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mixedContentMode={'compatibility'}
          injectedJavaScript={setupScript}
          onMessage={this.onMessage}
          useWebKit
          originWhitelist={['*']}
          onNavigationStateChange={event => {
            if (event.url.indexOf('download') !== -1 && Platform.OS === 'ios') {
              this.refs.webView.stopLoading();
              Linking.openURL(event.url);
            } else if (event.url.indexOf(this.state.url) === -1) {
              this.webView.stopLoading();
              Linking.openURL(event.url);
            } else {
              this.setState({url: this.state.url});
            }
          }}
          onError={() => {
            this.webView.reload();
          }}
          onShouldStartLoadWithRequest={e => {
            if (e.url.includes('about:srcdoc')) {
              return true;
            }

            if (e.url.indexOf('/download?') != -1) {
              Linking.openURL(e.url);
              return false;
            } else if (e.url.indexOf(this.state.url) === -1) {
              Linking.openURL(e.url);
              return false;
            }
            return true;
          }}
          onLoadStart={e => {
            if (e.nativeEvent.url.indexOf('/download?') != -1) {
              this.webView.reload();
            }
            this.setState({
              isLoading: true,
            });
          }}
          onLoadEnd={() => {
            this.setState({
              isLoading: false,
            });
          }}
        />
        <NavigationBar
          goBack={() => this.webView.goBack()}
          reload={() => this.webView.reload()}
          goForward={() => this.webView.goForward()}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#708fa0',
  },
  webView: {
    backgroundColor: '#708fa0',
    flex: 1,
  },
});

// const copyToClipboard = () => {
//   Clipboard.setString(this.state.token);
// };

{/* <View>
<Text>----------------</Text>
<Text>----------------</Text>
<Text>----------------</Text>
<Text>----------------</Text>
<TouchableOpacity onPress={copyToClipboard}>
  <Text>{BASE_URL}</Text>
  <Text>{this.state.token}'</Text>
</TouchableOpacity>
<Text>----------------</Text>
<Text>----------------</Text>
<Text>----------------</Text>
</View> */}