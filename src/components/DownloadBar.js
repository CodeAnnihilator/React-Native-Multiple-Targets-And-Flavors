import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import Button from './Button';
import {download} from '../utils/download';

const DownloadBar = ({data, goBack}) => {
  return (
    <View style={styles.container}>
      <Button onPress={() => download(data, goBack)}>
        <Text style={styles.button}>{'⤓'}</Text>
      </Button>
      <Button onPress={goBack}>
        <Text style={[styles.button, styles.buttonSmall]}>{'✕'}</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.08,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderTopColor: '#708fa9',
    borderTopWidth: 0.7,
  },
  button: {
    color: '#708fa9',
    fontSize: 50,
    textTransform: 'uppercase',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: {
    fontSize: 30,
  },
});

export default DownloadBar;
