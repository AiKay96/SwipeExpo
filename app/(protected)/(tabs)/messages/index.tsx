import { messageUsers, MessageUser } from '@/data/messages';
import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';

interface MessageItemProps {
  user: MessageUser;
  lastMessage?: string;
  timestamp?: string;
  isOnline?: boolean;
  hasUnread?: boolean;
  onPress: () => void;
}

function MessageItem({ user, lastMessage = "Active now", timestamp = "now", isOnline = true, hasUnread = false, onPress }: MessageItemProps) {
  return (
    <TouchableOpacity style={styles.messageItem} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: user.profilePhoto }} style={styles.avatar} />
        {isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>
        <Text style={[styles.lastMessage, hasUnread && styles.unreadMessage]}>
          {lastMessage}
        </Text>
      </View>
      
      {hasUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  
  // Add some sample last messages and timestamps
  const messagesWithData = messageUsers.map((user, index) => ({
    user,
    lastMessage: index % 3 === 0 ? "Active now" : index % 2 === 0 ? "You: Thanks! 🙌" : "Hey! How are you doing?",
    timestamp: index % 4 === 0 ? "now" : index % 3 === 0 ? "2m" : index % 2 === 0 ? "1h" : "3h",
    isOnline: index % 3 === 0,
    hasUnread: index % 4 === 1
  }));

  const handleChatPress = (username: string) => {
    router.push(`/messages/@${username}`);
  };

  const renderMessageItem = ({ item }: { item: typeof messagesWithData[0] }) => (
    <MessageItem 
      {...item} 
      onPress={() => handleChatPress(item.user.username)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {/* <TouchableOpacity style={styles.newMessageButton}>
          <Text style={styles.newMessageText}>✎</Text>
        </TouchableOpacity> */}
      </View>
      
      <FlatList
        data={messagesWithData}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.user.id}
        showsVerticalScrollIndicator={false}
        style={styles.messagesList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  newMessageText: {
    fontSize: 18,
    color: "#000",
  },
  messagesList: {
    flex: 1,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#44c662",
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageContent: {
    flex: 1,
    justifyContent: "center",
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  displayName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flex: 1,
  },
  timestamp: {
    fontSize: 14,
    color: "#8e8e8e",
    marginLeft: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: "#8e8e8e",
    lineHeight: 18,
  },
  unreadMessage: {
    color: "#000",
    fontWeight: "500",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0095f6",
    marginLeft: 8,
  },
});