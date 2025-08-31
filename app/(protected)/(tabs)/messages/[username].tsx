import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from "react-native";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { messageUsers, MessageUser } from '@/data/messages';

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

// Sample messages data
const sampleMessages: Message[] = [
  {
    id: "1",
    text: "Hey! How are you doing?",
    timestamp: "10:30 AM",
    isOwn: false,
  },
  {
    id: "2",
    text: "I'm doing great! Just finished a hike. How about you?",
    timestamp: "10:32 AM",
    isOwn: true,
  },
  {
    id: "3",
    text: "That sounds amazing! I've been working on a new project",
    timestamp: "10:35 AM",
    isOwn: false,
  },
  {
    id: "4",
    text: "Nice! What kind of project?",
    timestamp: "10:36 AM",
    isOwn: true,
  },
  {
    id: "5",
    text: "It's a mobile app for tracking outdoor activities. Still in early stages but excited about it!",
    timestamp: "10:38 AM",
    isOwn: false,
  },
  {
    id: "6",
    text: "That's so cool! I'd love to hear more about it 🙌",
    timestamp: "10:40 AM",
    isOwn: true,
  },
];

function MessageBubble({ message }: { message: Message }) {
  return (
    <View style={[styles.messageContainer, message.isOwn ? styles.ownMessageContainer : styles.otherMessageContainer]}>
      <View style={[styles.messageBubble, message.isOwn ? styles.ownMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, message.isOwn ? styles.ownMessageText : styles.otherMessageText]}>
          {message.text}
        </Text>
      </View>
      <Text style={[styles.messageTimestamp, message.isOwn ? styles.ownTimestamp : styles.otherTimestamp]}>
        {message.timestamp}
      </Text>
    </View>
  );
}

export default function DirectMessageScreen() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  
  // Find the user data based on username
  const currentUser = messageUsers.find(user => user.username === username?.replace('@', ''));
  
  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image source={{ uri: currentUser.profilePhoto }} style={styles.headerAvatar} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{currentUser.displayName}</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ⓘ</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Message..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : null]} 
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={[styles.sendButtonText, newMessage.trim() ? styles.sendButtonTextActive : null]}>
              Send
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: "#000",
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  headerStatus: {
    fontSize: 12,
    color: "#8e8e8e",
    marginTop: 2,
  },
  infoButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  infoButtonText: {
    fontSize: 20,
    color: "#000",
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  ownMessage: {
    backgroundColor: "#0095f6",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: "#000",
  },
  messageTimestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 16,
  },
  ownTimestamp: {
    color: "#8e8e8e",
    textAlign: "right",
  },
  otherTimestamp: {
    color: "#8e8e8e",
    textAlign: "left",
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f8f8",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 44,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: "#000",
  },
  sendButton: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sendButtonActive: {
    backgroundColor: "#0095f6",
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8e8e8e",
  },
  sendButtonTextActive: {
    color: "#fff",
  },
});