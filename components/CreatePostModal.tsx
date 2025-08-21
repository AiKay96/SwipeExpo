import { Colors } from '@/constants/Colors';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from "expo-linear-gradient";
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const API_URL =
  Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_API_URL_ALTERNATIVE
    : process.env.EXPO_PUBLIC_API_URL;

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [categoryTags, setCategoryTags] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [loading, setLoading] = useState(false);

  const getToken = async (): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem("auth-key");
      if (value) {
        const parsed = JSON.parse(value);
        return parsed.token;
      }
    } catch (error) {
      console.error("Error getting token from storage:", error);
    }
    return null;
  };

  const resetForm = () => {
    setSelectedImage(undefined);
    setDescription('');
    setCategoryTags('');
    setHashtags('');
    setCategoryId('');
    setReferenceId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImageAsync = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const createPost = async () => {
    if (!selectedImage || !description.trim()) {
      Alert.alert('Missing Information', 'Please select an image and add a description.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) throw new Error("Token not found");

      // Create FormData with all data including the image
      const formData = new FormData();
      
      // Add the image file
      formData.append('media', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'image.jpg',
      } as any);

      // Add all the form fields
      formData.append('category_id', categoryId.trim() || "3fa85f64-5717-4562-b3fc-2c963f66afa6");
      formData.append('reference_id', referenceId.trim() || "3fa85f64-5717-4562-b3fc-2c963f66afa6");
      formData.append('description', description.trim());
      
      // Add arrays as JSON strings
      const categoryTagsList = categoryTags.trim() ? categoryTags.split(',').map(tag => tag.trim()) : [];
      const hashtagsList = hashtags.trim() ? hashtags.split(',').map(tag => tag.trim().replace('#', '')) : [];
      
      formData.append('category_tag_names', JSON.stringify(categoryTagsList));
      formData.append('hashtag_names', JSON.stringify(hashtagsList));
      formData.append('media_type', 'image');

      // Send everything in one request
      const response = await fetch(`${API_URL}/creator-posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      Alert.alert('Success', 'Post created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onClose();
          }
        }
      ]);

    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={[Colors.light.gradientMid, Colors.light.gradientBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Post</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Image Selection */}
            <View style={styles.imageSection}>
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close-circle" size={30} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImageAsync}>
                  <Ionicons name="camera-outline" size={50} color={Colors.light.textPurple} />
                  <Text style={styles.placeholderText}>Tap to select image</Text>
                </TouchableOpacity>
              )}
              
              {!selectedImage && (
                <TouchableOpacity style={styles.selectButton} onPress={pickImageAsync}>
                  <Text style={styles.selectButtonText}>Choose from Gallery</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  multiline
                  numberOfLines={4}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What's on your mind?"
                  placeholderTextColor={Colors.light.referenceText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category Tags</Text>
                <TextInput
                  style={styles.input}
                  value={categoryTags}
                  onChangeText={setCategoryTags}
                  placeholder="gaming, art, music (comma separated)"
                  placeholderTextColor={Colors.light.referenceText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hashtags</Text>
                <TextInput
                  style={styles.input}
                  value={hashtags}
                  onChangeText={setHashtags}
                  placeholder="#fun, #creative, #awesome (comma separated)"
                  placeholderTextColor={Colors.light.referenceText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={categoryId}
                  onChangeText={setCategoryId}
                  placeholder="Leave empty to use default"
                  placeholderTextColor={Colors.light.referenceText}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Reference ID (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={referenceId}
                  onChangeText={setReferenceId}
                  placeholder="Leave empty to use default"
                  placeholderTextColor={Colors.light.referenceText}
                />
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity 
              style={[styles.createButton, (!selectedImage || !description.trim() || loading) && styles.disabledButton]} 
              onPress={createPost}
              disabled={!selectedImage || !description.trim() || loading}
            >
              <LinearGradient
                colors={[Colors.light.gradientPink, Colors.light.gradientBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Create Post</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.light.referenceBack,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.iconLight,
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  placeholderText: {
    marginTop: 10,
    color: Colors.light.textPurple,
    fontSize: 16,
  },
  selectedImageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
  },
  selectButton: {
    backgroundColor: Colors.light.gradientBlue,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPurple,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.referenceBack,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: Colors.light.textPurple,
    borderWidth: 1,
    borderColor: Colors.light.iconLight,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 30,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});