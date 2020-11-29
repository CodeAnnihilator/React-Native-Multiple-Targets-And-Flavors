import React from 'react';

import {View, Text, StyleSheet} from 'react-native';

import Button from './Button';

const NavigationBar = ({goBack, reload, goForward, style = {}}) => {
  return (
    <View style={[styles.container, style]}>
      <Button onPress={goBack}>
        <Text style={styles.button}>{'←'}</Text>
      </Button>
      <Button onPress={reload}>
        <Text style={[styles.button, {fontSize: 23}]}>{'↻'}</Text>
      </Button>
      <Button onPress={goForward}>
        <Text style={styles.button}>{'→'}</Text>
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
    fontSize: 30,
  },
});

export default NavigationBar;
