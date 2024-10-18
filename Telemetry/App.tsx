import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import dgram from 'react-native-udp';
import NetInfo from '@react-native-community/netinfo';
import CircularProgress from 'react-native-circular-progress-indicator';

// Define the type for the data received
interface RaceData {
  isRaceOn: number;
  timestampMS: number;
  engineMaxRpm: number;
  engineIdleRpm: number;
  currentEngineRpm: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  angularVelocityX: number;
  angularVelocityY: number;
  angularVelocityZ: number;
  yaw: number;
  pitch: number;
  roll: number;
  normalizedSuspensionTravelFrontLeft: number;
  normalizedSuspensionTravelFrontRight: number;
  normalizedSuspensionTravelRearLeft: number;
  normalizedSuspensionTravelRearRight: number;
  tireSlipRatioFrontLeft: number;
  tireSlipRatioFrontRight: number;
  tireSlipRatioRearLeft: number;
  tireSlipRatioRearRight: number;
  wheelRotationSpeedFrontLeft: number;
  wheelRotationSpeedFrontRight: number;
  wheelRotationSpeedRearLeft: number;
  wheelRotationSpeedRearRight: number;
  wheelOnRumbleStripFrontLeft: number;
  wheelOnRumbleStripFrontRight: number;
  wheelOnRumbleStripRearLeft: number;
  wheelOnRumbleStripRearRight: number;
  wheelInPuddleDepthFrontLeft: number;
  wheelInPuddleDepthFrontRight: number;
  wheelInPuddleDepthRearLeft: number;
  wheelInPuddleDepthRearRight: number;
  surfaceRumbleFrontLeft: number;
  surfaceRumbleFrontRight: number;
  surfaceRumbleRearLeft: number;
  surfaceRumbleRearRight: number;
  tireSlipAngleFrontLeft: number;
  tireSlipAngleFrontRight: number;
  tireSlipAngleRearLeft: number;
  tireSlipAngleRearRight: number;
  tireCombinedSlipFrontLeft: number;
  tireCombinedSlipFrontRight: number;
  tireCombinedSlipRearLeft: number;
  tireCombinedSlipRearRight: number;
  suspensionTravelMetersFrontLeft: number;
  suspensionTravelMetersFrontRight: number;
  suspensionTravelMetersRearLeft: number;
  suspensionTravelMetersRearRight: number;
  carOrdinal: number;
  carClass: number;
  carPerformanceIndex: number;
  drivetrainType: number;
  numCylinders: number;
  positionX: number;
  positionY: number;
  positionZ: number;
  speed: number;
  power: number;
  torque: number;
  tireTempFrontLeft: number;
  tireTempFrontRight: number;
  tireTempRearLeft: number;
  tireTempRearRight: number;
  boost: number;
  fuel: number;
  distanceTraveled: number;
  bestLap: number;
  lastLap: number;
  currentLap: number;
  currentRaceTime: number;
  lapNumber: number;
  racePosition: number;
  accel: number;
  brake: number;
  clutch: number;
  handBrake: number;
  gear: number;
  steer: number;
  normalizedDrivingLine: number;
  normalizedAIBrakeDifference: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<RaceData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    // Check initial connection status
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    NetInfo.fetch().then(state => {
      if (state.details && 'ipAddress' in state.details) {
        setIpAddress((state.details as any).ipAddress);
      }
    });

    return () => {
      unsubscribe(); // Clean up the event listener
    };
  }, []);

  useEffect(() => {
    const udpSocket = dgram.createSocket({ type: 'udp4' });

    udpSocket.on('error', (err) => {
      console.error(`Socket error: ${err}`);
    });

    udpSocket.on('message', (message, remote) => {
      console.log(`Received message of length: ${message.length}`);

      const expectedLength = 232; // Update this based on your expected message length

      if (message.length < expectedLength) {
        console.warn(`Received incomplete message of length ${message.length}. Expected at least ${expectedLength}.`);
        return; // Skip processing this message
      }

      try {
        let jump = 0;
        let obj: RaceData = {} as RaceData;

        obj.isRaceOn = message.readInt32LE(jump);
        jump += 4;
        obj.timestampMS = message.readUInt32LE(jump); //Getting wrong data
        jump += 4;
        obj.engineMaxRpm = message.readFloatLE(jump);
        jump += 4;
        obj.engineIdleRpm = message.readFloatLE(jump);
        jump += 4;
        obj.currentEngineRpm = message.readFloatLE(jump);
        jump += 4;
    
        obj.accelerationX = message.readFloatLE(jump); //In the car's local space; X = right, Y = up, Z = forward
        jump += 4;
        obj.accelerationY = message.readFloatLE(jump);
        jump += 4;
        obj.accelerationZ = message.readFloatLE(jump);
        jump += 4;
    
        obj.velocityX = message.readFloatLE(jump); //In the car's local space; X = right, Y = up, Z = forward
        jump += 4;
        obj.velocityY = message.readFloatLE(jump);
        jump += 4;
        obj.velocityZ = message.readFloatLE(jump);
        jump += 4;
    
        obj.angularVelocityX = message.readFloatLE(jump); //In the car's local space; X = pitch, Y = yaw, Z = roll
        jump += 4;
        obj.angularVelocityY = message.readFloatLE(jump);
        jump += 4;
        obj.angularVelocityZ = message.readFloatLE(jump);
        jump += 4;
    
        obj.yaw = message.readFloatLE(jump);
        jump += 4;
        obj.pitch = message.readFloatLE(jump);
        jump += 4;
        obj.roll = message.readFloatLE(jump);
        jump += 4;
    
        obj.normalizedSuspensionTravelFrontLeft = message.readFloatLE(jump); // Suspension travel normalized: 0.0f = max stretch; 1.0 = max compression
        jump += 4;
        obj.normalizedSuspensionTravelFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.normalizedSuspensionTravelRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.normalizedSuspensionTravelRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.tireSlipRatioFrontLeft = message.readFloatLE(jump); // Tire normalized slip ratio, = 0 means 100% grip and |ratio| > 1.0 means loss of grip.
        jump += 4;
        obj.tireSlipRatioFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.tireSlipRatioRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.tireSlipRatioRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.wheelRotationSpeedFrontLeft = message.readFloatLE(jump); // Wheel rotation speed radians/sec.
        jump += 4; 
        obj.wheelRotationSpeedFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.wheelRotationSpeedRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.wheelRotationSpeedRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.wheelOnRumbleStripFrontLeft = message.readFloatLE(jump); // = 1 when wheel is on rumble strip, = 0 when off.
        jump += 4;
        obj.wheelOnRumbleStripFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.wheelOnRumbleStripRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.wheelOnRumbleStripRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.wheelInPuddleDepthFrontLeft = message.readFloatLE(jump); // = from 0 to 1, where 1 is the deepest puddle
        jump += 4;
        obj.wheelInPuddleDepthFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.wheelInPuddleDepthRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.wheelInPuddleDepthRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.surfaceRumbleFrontLeft = message.readFloatLE(jump); // Non-dimensional surface rumble values passed to controller force feedback
        jump += 4;
        obj.surfaceRumbleFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.surfaceRumbleRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.surfaceRumbleRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.tireSlipAngleFrontLeft = message.readFloatLE(jump); // Tire normalized slip angle, = 0 means 100% grip and |angle| > 1.0 means loss of grip.
        jump += 4;
        obj.tireSlipAngleFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.tireSlipAngleRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.tireSlipAngleRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.tireCombinedSlipFrontLeft = message.readFloatLE(jump); // Tire normalized combined slip, = 0 means 100% grip and |slip| > 1.0 means loss of grip.
        jump += 4;
        obj.tireCombinedSlipFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.tireCombinedSlipRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.tireCombinedSlipRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.suspensionTravelMetersFrontLeft = message.readFloatLE(jump); // Actual suspension travel in meters
        jump += 4;
        obj.suspensionTravelMetersFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.suspensionTravelMetersRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.suspensionTravelMetersRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.carOrdinal = message.readInt32LE(jump); //Unique ID of the car make/model
        jump += 4;
        obj.carClass = message.readInt32LE(jump); //Between 0 (D -- worst cars) and 7 (X class -- best cars) inclusive 
        jump += 4;
        obj.carPerformanceIndex = message.readInt32LE(jump); //Between 100 (slowest car) and 999 (fastest car) inclusive
        jump += 4;
        obj.drivetrainType = message.readInt32LE(jump); //Corresponds to EDrivetrainType; 0 = FWD, 1 = RWD, 2 = AWD
        jump += 4;
        obj.numCylinders = message.readInt32LE(jump); //Number of cylinders in the engine
        jump += 4;
    
        //Position (meters)
        obj.positionX = message.readFloatLE(jump);
        jump += 4;
        obj.positionY = message.readFloatLE(jump);
        jump += 4;
        obj.positionZ = message.readFloatLE(jump);
        jump += 4;
    
        obj.speed = message.readFloatLE(jump); // meters per second
        jump += 4;
        obj.power = message.readFloatLE(jump); // watts
        jump += 4;
        obj.torque = message.readFloatLE(jump); // newton meter
        jump += 4;
    
        obj.tireTempFrontLeft = message.readFloatLE(jump);
        jump += 4;
        obj.tireTempFrontRight = message.readFloatLE(jump);
        jump += 4;
        obj.tireTempRearLeft = message.readFloatLE(jump);
        jump += 4;
        obj.tireTempRearRight = message.readFloatLE(jump);
        jump += 4;
    
        obj.boost = message.readFloatLE(jump);
        jump += 4;
        obj.fuel = message.readFloatLE(jump);
        jump += 4;
        obj.distanceTraveled = message.readFloatLE(jump);
        jump += 4;
        obj.bestLap = message.readFloatLE(jump); // seconds
        jump += 4;
        obj.lastLap = message.readFloatLE(jump); // seconds
        jump += 4;
        obj.currentLap = message.readFloatLE(jump); // seconds
        jump += 4;
        obj.currentRaceTime = message.readFloatLE(jump); // seconds
        jump += 4;
    
        obj.lapNumber = message.readUInt16LE(jump);
        jump += 2;
        obj.racePosition = message.readUInt8(jump);
        jump += 1;
    
        obj.accel = message.readUInt8(jump); // 0 - 255
        jump += 1;
        obj.brake = message.readUInt8(jump); // 0 - 255
        jump += 1;
        obj.clutch = message.readUInt8(jump);
        jump += 1;
        obj.handBrake = message.readUInt8(jump);
        jump += 1;
        obj.gear = message.readUInt8(jump);
        jump += 1;
        obj.steer = message.readUInt8(jump);
        jump += 1;
    
        obj.normalizedDrivingLine = message.readUInt8(jump);
        jump += 1;
        obj.normalizedAIBrakeDifference = message.readUInt8(jump);
        jump += 1;

        // (Continue parsing all fields as in the original code)
        // Note: Make sure you account for every field and update 'jump' correctly

        // Update state with the new data
        setData(obj);
      } catch (error) {
        console.error(`Error while parsing UDP message: ${error.message}`);
      }
    });

    const PORT = 5301;
    const HOST = '0.0.0.0'; // Change this to your desired host

    udpSocket.bind(PORT, HOST, () => {
      console.log(`UDP Socket listening on ${HOST}:${PORT}`);
    });

    return () => {
      udpSocket.close();
    };
  }, []);

  return (
    <View style={styles.container}>
      <CircularProgress
        value={60}
        radius={120}
        duration={2000}
        progressValueColor={'#ecf0f1'}
        maxValue={200}
        title={'KM/H'}
        titleColor={'white'}
        titleStyle={{fontWeight: 'bold'}}
      />
      <Text style={styles.title}>UDP Data:</Text>
      <Text style={styles.dataText}>
      {data ? (
    <>
      <Text style={styles.dataText}>Speed: {data.speed}</Text>
      <Text style={styles.dataText}>Current Lap: {data.currentLap}</Text>
      <Text style={styles.dataText}>Race Position: {data.racePosition}</Text>
      <Text style={styles.dataText}>Position X: {data.positionX}</Text>
      <Text style={styles.dataText}>Position Z: {data.positionZ}</Text>

      {/* Add more fields as needed */}
    </>
  ) : (
    <Text style={styles.dataText}>Waiting for data...</Text>
  )}
      </Text>
      <Text style={styles.connectionStatus}>
        {isConnected === null
          ? 'Checking connection...'
          : isConnected
          ? 'Connected to the Internet'
          : 'No Internet Connection'}
      </Text>
      <Text style={styles.title}>Your IP Address:</Text>
      <Text style={styles.ipText}>{ipAddress ? ipAddress : 'Fetching IP...'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dataText: {
    fontSize: 14,
    color: 'gray',
  },
  ipText: {
    fontSize: 16,
    color: 'blue',
    marginTop: 8,
  },
  connectionStatus: {
    marginTop: 16,
    fontSize: 16,
    color: 'blue',
  },
});

export default App;
