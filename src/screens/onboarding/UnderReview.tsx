import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

// Removed unused Step component

const UnderReview = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <Svg width={90} height={90} viewBox="0 0 90 90" fill="none">
          <Rect x="15" y="15" width="60" height="60" rx="10" fill="#D32F2F" />
          <Path d="M45 30v20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <Path d="M45 60a3 3 0 100-6 3 3 0 000 6z" fill="#fff" />
        </Svg>
      </View>
      <Text style={styles.heading}>Your documents are under review</Text>
      <Text style={styles.subheading}>You may be required to submit additional{"\n"}documents</Text>
      <View style={styles.stepperContainer}>
        <View style={styles.stepRow}>
          <View style={styles.stepIndicatorColumn}>
            <View style={styles.activeStepDot} />
            <View style={styles.stepLine} />
          </View>
          <View style={styles.stepTextColumn}>
            <Text style={styles.stepTitleText}>Document Received</Text>
            <Text style={styles.stepSubtitleText}>Submitted</Text>
          </View>
        </View>
        {/* Step 2 */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicatorColumn}>
            <View style={styles.inactiveStepDot} />
            <View style={styles.stepLine} />
          </View>
          <View style={styles.stepTextColumn}>
            <Text style={styles.stepTitleText}>Documents in Verification</Text>
            <Text style={styles.stepSubtitleText}>It may take upto 24 hours to verify your details.{"\n"}We will notify when we're done.</Text>
          </View>
        </View>
        {/* Step 3 */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicatorColumn}>
            <View style={styles.inactiveStepDot} />
          </View>
          <View style={styles.stepTextColumn}>
            <Text style={styles.stepTitleText}>Successfully Onboard</Text>
            <Text style={styles.stepSubtitleText}>Go to Homepage</Text>
          </View>
        </View>
      </View>
      <Text style={styles.bottomText}>Come back later to check the status of your KYC</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 32 : 16,
  },
  iconContainer: {
    marginTop: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111',
  },
  subheading: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  stepperContainer: {
    width: '100%',
    marginBottom: 40,
    marginLeft: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 60,
  },
  stepIndicatorColumn: {
    width: 32,
    alignItems: 'center',
  },
  activeStepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1565C0',
    borderWidth: 2,
    borderColor: '#1565C0',
    marginTop: 2,
  },
  inactiveStepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginTop: 2,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#BDBDBD',
    marginVertical: 0,
  },
  stepTextColumn: {
    flex: 1,
    paddingLeft: 8,
    paddingTop: 2,
  },
  stepTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
  },
  stepSubtitleText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  bottomText: {
    position: 'absolute',
    bottom: 72,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
});

export default UnderReview;
