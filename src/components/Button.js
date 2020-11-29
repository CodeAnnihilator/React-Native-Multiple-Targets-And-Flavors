import React from 'react';

import {TouchableHighlight, StyleSheet} from 'react-native';

const Button = ({onPress, children, style = {}, ...rest}) => {
  return (
    <TouchableHighlight
      style={[styles.container, style]}
      onPress={onPress}
      {...rest}>
      {children}
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Button;
