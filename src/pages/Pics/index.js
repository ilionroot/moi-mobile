import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import {RNCamera} from 'react-native-camera';

import {useGeral} from '../../contexts/geral';

import {api} from '../../services/api';
import * as RootNavigation from '../../../RootNavigation';

import {styles} from './styles';

const Pics = () => {
  const {deviceId} = useGeral();

  const [isBackCam, setIsBackCam] = React.useState(false);
  const [isPreview, setIsPreview] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photo, setPhoto] = React.useState({});

  let cameraRef = React.useRef(null);

  async function flipCam() {
    setIsBackCam(!isBackCam);
  }

  async function takePicture() {
    try {
      const data = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        mirrorImage: !isBackCam,
        fixOrientation: !isBackCam,
      });

      setPhoto(data);
      setIsPreview(true);
    } catch (error) {
      console.log(error, 'ERROR <<<<<<<<<<<<<');
    }
  }

  function cancel() {
    setPhoto({});
    setIsPreview(false);
    setIsLoading(false);
  }

  function send() {
    setIsLoading(true);

    const filename = photo.uri.split('/').pop();
    const ext = photo.uri.split('.').pop();
    const metadata = `image/${ext}`;

    let formData = new FormData();

    formData.append('photo', {
      uri: photo.uri,
      name: filename,
      type: metadata,
    });
    formData.append('device_id', deviceId);

    api
      .post('/now-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        cancel();
        RootNavigation.navigate('Home');
        Alert.alert('Etcha', 'Foto enviada com sucesso!');
      })
      .catch(err => {
        Alert.alert('Falha', 'Erro ao enviar a foto ):');
        cancel();
      });
  }

  const CameraComponent = ({cameraRef, isBackCam}) => {
    return (
      <View style={styles.camContainer}>
        <RNCamera
          ref={cameraRef}
          captureAudio={false}
          style={styles.cam}
          androidCameraPermissionOptions={{
            title: 'Permissāo para usar a câmera',
            message: 'Nós precisamos da sua permissāo para usar a câmera 📷!',
            buttonPositive: 'Tudo certo!',
            buttonNegative: 'Cancelar ):',
          }}
          type={
            isBackCam
              ? RNCamera.Constants.Type.back
              : RNCamera.Constants.Type.front
          }>
          <Text>.</Text>
        </RNCamera>
        <TouchableOpacity
          onPress={takePicture}
          activeOpacity={0.75}
          style={styles.takePictureButton}
        />
        {isPreview && (
          <>
            <Image
              style={styles.preview}
              source={{
                uri: photo.uri
                  ? photo.uri
                  : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
              }}
            />
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={cancel}
                activeOpacity={0.75}
                style={styles.actionButton}>
                <Text style={styles.backText}>Cancelar</Text>
              </TouchableOpacity>

              {isLoading ? (
                <ActivityIndicator
                  style={styles.loader}
                  color={'#F24949'}
                  size={32}
                />
              ) : (
                <TouchableOpacity
                  onPress={send}
                  activeOpacity={0.75}
                  style={styles.actionButton}>
                  <Text style={styles.backText}>Enviar</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>De agora</Text>
        <TouchableOpacity activeOpacity={0.75} onPress={flipCam}>
          <Ionicons
            color={'rgba(0,0,0,0.85)'}
            size={32}
            name="camera-reverse"
          />
        </TouchableOpacity>
      </View>
      <CameraComponent cameraRef={cameraRef} isBackCam={isBackCam} />
    </View>
  );
};

export default Pics;
