import { Colors } from '@/constants/Colors';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity } from "react-native";
import { useState, useEffect } from 'react';

// Import your data
import { friendRequests, FriendRequest } from '@/data/friend-requests'; // Adjust the path as needed

const PlaceholderProfileImage = require("@/assets/images/profile-image-example.jpg");

// Horizontal Progress Component
const HorizontalProgress = ({ percentage }: { percentage: number }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${percentage}%` }
          ]} 
        />
      </View>
      <Text style={styles.percentageText}>{percentage}%</Text>
    </View>
  );
};

export default function SuggestsScreen() {
  const [friendRequestsData, setFriendRequestsData] = useState<FriendRequest[]>([]);
  const [suggestionsData, setSuggestionsData] = useState<FriendRequest[]>([]);

  useEffect(() => {
    // Split the data - first 5 for friend requests, rest for suggestions
    setFriendRequestsData(friendRequests.slice(0, 5));
    setSuggestionsData(friendRequests.slice(5));
  }, []);

  const handleAcceptFriend = (id: string) => {
    console.log("Accepting friend request:", id);
    setFriendRequestsData(prev => prev.filter(request => request.id !== id));
  };

  const handleRejectFriend = (id: string) => {
    console.log("Rejecting friend request:", id);
    setFriendRequestsData(prev => prev.filter(request => request.id !== id));
  };

  const handleInterested = (id: string) => {
    console.log("Interested in:", id);
    setSuggestionsData(prev => prev.filter(suggestion => suggestion.id !== id));
  };

  const handleNotInterested = (id: string) => {
    console.log("Not interested in:", id);
    setSuggestionsData(prev => prev.filter(suggestion => suggestion.id !== id));
  };

  const renderFriendRequest = (item: FriendRequest) => (
    <View key={item.id} style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.rejectButton}
          onPress={() => handleRejectFriend(item.id)}
        >
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <TouchableOpacity 
          style={styles.acceptButton}
          onPress={() => handleAcceptFriend(item.id)}
        >
          <Text style={styles.acceptText}>Accept</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.profilePhoto }}
          style={styles.profileImage}
          defaultSource={PlaceholderProfileImage}
          onError={(e) => console.log("Image failed to load:", e.nativeEvent.error)}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.mutualText}>{item.mutual} mutual friends</Text>
      </View>
      
      <View style={styles.categoriesContainer}>
        {item.overlappingCategories.map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.matchContainer}>
        <Text style={styles.matchLabel}>Interest Match</Text>
        <HorizontalProgress percentage={item.interestMatch} />
      </View>
    </View>
  );

  const renderSuggestion = (item: FriendRequest) => (
    <View key={item.id} style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <TouchableOpacity 
          style={styles.notInterestedButton}
          onPress={() => handleNotInterested(item.id)}
        >
          <Text style={styles.notInterestedText}>Not Interested</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
        </View>
        <TouchableOpacity 
          style={styles.interestedButton}
          onPress={() => handleInterested(item.id)}
        >
          <Text style={styles.interestedText}>Interested</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.profilePhoto }}
          style={styles.profileImage}
          defaultSource={PlaceholderProfileImage}
          onError={(e) => console.log("Image failed to load:", e.nativeEvent.error)}
        />
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.mutualText}>{item.mutual} mutual friends</Text>
      </View>
      
      <View style={styles.categoriesContainer}>
        {item.overlappingCategories.map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.matchContainer}>
        <Text style={styles.matchLabel}>Interest Match</Text>
        <HorizontalProgress percentage={item.interestMatch} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.fullContainer}>
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Friend Requests Section */}
          {friendRequestsData.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Friend Requests:</Text>
              {friendRequestsData.map(renderFriendRequest)}
            </>
          )}

          {/* Suggestions Section */}
          {suggestionsData.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: friendRequestsData.length > 0 ? 24 : 0 }]}>
                Suggestions:
              </Text>
              {suggestionsData.map(renderSuggestion)}
            </>
          )}

          {/* Empty State - when both sections are empty */}
          {friendRequestsData.length === 0 && suggestionsData.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No friend requests or suggestions available</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 20,
  },
  fullContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.textPurple,
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  requestCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.light.iconLight,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textPurple,
    textAlign: "center",
  },
  userInfo: {
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  mutualText: {
    fontSize: 13,
    color: Colors.light.referenceText,
    textAlign: "center",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 12,
    gap: 6,
  },
  categoryTag: {
    backgroundColor: Colors.light.referenceBack,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.light.iconLight,
  },
  categoryText: {
    fontSize: 11,
    color: Colors.light.textPurple,
    fontWeight: "500",
  },
  matchContainer: {
    alignItems: "center",
    marginTop: 12,
  },
  matchLabel: {
    fontSize: 12,
    color: Colors.light.referenceText,
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: "center",
    width: "100%",
  },
  progressBackground: {
    width: "80%",
    height: 8,
    backgroundColor: Colors.light.iconLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.gradientPink,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.light.textPurple,
    marginTop: 6,
  },
  acceptButton: {
    backgroundColor: Colors.light.gradientBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  acceptText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  rejectButton: {
    backgroundColor: "#ff4757",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
  },
  rejectText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  interestedButton: {
    backgroundColor: Colors.light.gradientPink,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  interestedText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  notInterestedButton: {
    backgroundColor: Colors.light.iconLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  notInterestedText: {
    color: Colors.light.textPurple,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: Colors.light.referenceText,
    fontSize: 16,
    textAlign: "center",
  },
});