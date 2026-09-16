import { Image, StyleSheet, View } from 'react-native';

export default function BrandMark() {
  return (
    <View style={styles.logoWrap}>
      <Image
        accessibilityLabel="Nexora"
        resizeMode="contain"
        source={require('../../assets/nexora-logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: { width: 154, height: 96, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 154, height: 96 },
});
