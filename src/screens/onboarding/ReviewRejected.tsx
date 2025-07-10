import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

const ReviewRejected = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.iconContainer}>
        <Svg width={90} height={90} viewBox="0 0 90 90" fill="none">
          <Rect x="15" y="15" width="60" height="60" rx="10" fill="#B71C1C" />
          <Path d="M45 30v20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
          <Path d="M45 60a3 3 0 100-6 3 3 0 000 6z" fill="#fff" />
        </Svg>
      </View>
      <Text style={styles.heading}>Your documents are under review</Text>
      <Text style={styles.subheading}>You may be required to submit additional{"\n"}documents</Text>
      <View style={styles.stepperContainer}>
        {/* Step 1 */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicatorColumn}>
            <View style={styles.blueStepDot} />
            <View style={styles.blueStepLine} />
          </View>
          <View style={styles.stepTextColumn}>
            <Text style={styles.stepTitleText}>Document Received</Text>
            <Text style={styles.stepSubtitleText}>Submitted</Text>
          </View>
        </View>
        {/* Step 2 - Failed */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicatorColumn}>
            <View style={styles.redStepDot} />
            <View style={styles.greyStepLine} />
          </View>
          <View style={styles.stepTextColumn}>
            <Text style={styles.stepTitleTextRed}>Documents Verification Failed</Text>
            <Text style={styles.stepSubtitleText}>Contact Fleet Manager</Text>
          </View>
        </View>
        {/* Step 3 */}
        <View style={styles.stepRow}>
          <View style={styles.stepIndicatorColumn}>
            <View style={styles.greyStepDot} />
          </View>
          <View style={styles.stepTextColumn}>
            <Text style={styles.stepTitleText}>Successfully Onboard</Text>
            <Text style={styles.stepSubtitleText}>Go to Homepage</Text>
          </View>
        </View>
      </View>
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
  blueStepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1976D2',
    borderWidth: 2,
    borderColor: '#1976D2',
    marginTop: 2,
  },
  blueStepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#1976D2',
    marginVertical: 0,
  },
  redStepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#B71C1C',
    borderWidth: 2,
    borderColor: '#B71C1C',
    marginTop: 2,
  },
  greyStepDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginTop: 2,
  },
  greyStepLine: {
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
  stepTitleTextRed: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#B71C1C',
  },
  stepSubtitleText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});

export default ReviewRejected; 