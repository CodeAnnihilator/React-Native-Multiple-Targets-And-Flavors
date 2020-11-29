import {request, PERMISSIONS} from 'react-native-permissions';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import {Platform, Alert} from 'react-native';

export const download = (data, androidCallback) => {
  if (data) {
    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then(() => {
        RNFetchBlob.config({
          fileCache: true,
          path: `${RNFetchBlob.fs.dirs.DownloadDir}/${data.file}`,
          addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${RNFetchBlob.fs.dirs.DownloadDir}/${data.file}`,
          },
        })
          .fetch('GET', data.path, {
            Authorization: 'Bearer ' + data.token,
            responseType: 'blob',
          })
          .then(res => {
            Alert.alert('Download Success !');
            if (androidCallback) {
              androidCallback();
            }
          })
          .catch(console.log);
      });
    } else {
      console.log(data);
      RNFetchBlob.config({
        fileCache: true,
        path: RNFetchBlob.fs.dirs.DocumentDir + `/${data.file}`,
      })
        .fetch('GET', data.path, {
          Authorization: 'Bearer ' + data.token,
          responseType: 'blob',
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
        })
        .catch(console.log);
    }
  }
};
