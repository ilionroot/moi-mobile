import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {useGeral} from '../../contexts/geral';
import {api} from '../../services/api';
import {styles} from './styles';
import colors from '../../../colors';

String.prototype.reverse = function () {
  return this.split('').reverse().join('');
};

const ModalComponent = ({toggleModal, createMessage}) => {
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <Modal
      statusBarTranslucent
      animationType="fade"
      transparent
      onRequestClose={toggleModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={{...styles.title, fontSize: 24}}>Criar mensagem</Text>
            <TouchableOpacity onPress={toggleModal} activeOpacity={0.75}>
              <AntDesign name="close" size={24} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            textAlignVertical="top"
            maxLength={350}
            onChangeText={text => setMessage(text)}
          />
          {isLoading ? (
            <ActivityIndicator
              color={'#F24949'}
              style={{marginVertical: 24}}
              size={32}
            />
          ) : (
            <TouchableOpacity
              onPress={async () => {
                setIsLoading(true);
                createMessage(message)
                  .then(() => {
                    setIsLoading(false);
                    toggleModal();
                  })
                  .catch(() => {
                    Alert.alert('Ops!', 'Algo deu errado, tente novamente.');
                    setIsLoading(false);
                    toggleModal();
                  });
              }}
              activeOpacity={0.75}
              style={styles.createButton}>
              <Text style={styles.createButtonText}>Criar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const Message = ({message, navigation, deviceId}) => {
  function openMessage() {
    navigation.navigate('Message', {message});
  }

  return (
    <TouchableOpacity
      onPress={openMessage}
      activeOpacity={0.75}
      style={styles.message}>
      <FontAwesome5
        name={message.from === deviceId ? 'arrow-right' : 'arrow-left'}
        size={24}
        color={message.from === deviceId ? colors.primary : 'purple'}
      />
      <Text numberOfLines={1} style={styles.messageText}>
        {message.text.substring(0, 85).reverse()}
      </Text>
    </TouchableOpacity>
  );
};

const Messages = ({navigation}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(true);

  const {deviceId} = useGeral();

  function toggleModal() {
    setModalVisible(!modalVisible);
  }

  function createMessage(message) {
    return new Promise((resolve, reject) => {
      api
        .post('/send-message', {
          text: message.reverse(),
          device_id: deviceId,
        })
        .then(res => {
          setMessages([...messages, {text: message, isFrom: deviceId}]);
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  function getMessages() {
    api
      .get(`/get-messages?device_id=${deviceId}`)
      .then(res => {
        setMessages(res.data.messages);
        setRefreshing(false);
      })
      .catch(err => {
        Alert.alert('Ops!', 'Algo deu errado, tente novamente.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  React.useEffect(() => {
    getMessages();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={toggleModal} activeOpacity={0.75}>
          <AntDesign name="plus" size={24} color="rgba(0,0,0,0.85)" />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator
          color={'#F24949'}
          style={{marginVertical: 24}}
          size={32}
        />
      ) : (
        <FlatList
          style={styles.messagesContainer}
          data={messages.reverse()}
          renderItem={({item}) => {
            return (
              <Message
                navigation={navigation}
                message={item}
                deviceId={deviceId}
              />
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 24,
                }}>
                <Text
                  style={{
                    fontFamily: 'Nunito-Regular',
                    opacity: 0.75,
                  }}>
                  Nenhuma mensagem por enquanto... 🤕
                </Text>
              </View>
            );
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={getMessages} />
          }
        />
      )}
      {modalVisible && (
        <ModalComponent
          toggleModal={toggleModal}
          createMessage={createMessage}
        />
      )}
    </View>
  );
};

export default Messages;
