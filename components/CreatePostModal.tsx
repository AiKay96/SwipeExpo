// CreatePostModal.tsx
import { Colors } from '@/constants/Colors';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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

interface Category {
  id: string;
  name: string;
  tags: string[];
}

interface Reference {
  id: string;
  category_id: string;
  title: string;
  description: string;
  image_url: string;
  tags: string[];
  attributes: any;
}

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined); // preview URI
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // For web: hold the picked File
  const [webFile, setWebFile] = useState<any | null>(null);
  const fileInputRef = useRef<any>(null);

  // Post type selection
  const [postType, setPostType] = useState<'personal' | 'creator' | null>(null);

  // Creator post specific states
  const [categories, setCategories] = useState<Category[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedReference, setSelectedReference] = useState<Reference | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [referenceSearchQuery, setReferenceSearchQuery] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showReferenceDropdown, setShowReferenceDropdown] = useState(false);

  useEffect(() => {
    if (visible && postType === 'creator') {
      fetchCategories();
    }
  }, [visible, postType]);

  useEffect(() => {
    if (selectedCategory) {
      fetchReferences(selectedCategory.id);
      setSelectedReference(null);
    }
  }, [selectedCategory]);

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

  const getAuthHeaders = async () => {
    const token = await getToken();
    if (!token) throw new Error("Token not found");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchCategories = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/reference/categories`, { headers });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchReferences = async (categoryId: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/reference/categories/${categoryId}/references`, { headers });
      setReferences(response.data.references);
    } catch (error) {
      console.error('Error fetching references:', error);
      setReferences([]);
    }
  };

  const resetForm = () => {
    setSelectedImage(undefined);
    setMediaUrl('');
    setDescription('');
    setHashtags([]);
    setHashtagInput('');
    setPostType(null);
    setSelectedCategory(null);
    setSelectedReference(null);
    setCategories([]);
    setReferences([]);
    setCategorySearchQuery('');
    setReferenceSearchQuery('');
    setShowCategoryDropdown(false);
    setShowReferenceDropdown(false);
    setWebFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ---------- Image pickers ----------

  // Native (iOS/Android)
  const pickImageNative = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need media library permission to select an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      await uploadImageBinary({ nativeUri: uri });
    }
  };

  // Web: use file input
  const clickWebPicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset
      fileInputRef.current.click();
    }
  };

  const onWebFileChange = async (e: any) => {
    const file: any = e?.target?.files?.[0];
    if (!file) return;
    setWebFile(file);
    const preview = URL.createObjectURL(file);
    setSelectedImage(preview);
    await uploadImageBinary({ webFile: file });
  };

  // ---------- Upload (platform-aware, raw binary) ----------

  const contentTypeFromName = (nameOrType: string) => {
    const lower = (nameOrType || '').toLowerCase();
    if (lower.includes('image/jpeg') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.includes('image/png') || lower.endsWith('.png')) return 'image/png';
    if (lower.includes('image/webp') || lower.endsWith('.webp')) return 'image/webp';
    if (lower.includes('image/gif')  || lower.endsWith('.gif'))  return 'image/gif';
    return 'image/jpeg';
  };

  async function uploadImageBinary(opts: { nativeUri?: string; webFile?: any }) {
    try {
      setUploadingImage(true);
      const headers = await getAuthHeaders();
      const url = `${API_URL}/media`;

      if (Platform.OS === 'web' && opts.webFile) {
        // ---- WEB: fetch with File as the body (no multipart) ----
        const file = opts.webFile as File;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': contentTypeFromName(file.type || file.name),
          },
          body: file, // raw bytes
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.error('Upload failed:', res.status, text);
          Alert.alert('Upload error', `Failed with ${res.status}`);
          return;
        }
        const body = await res.json();
        setMediaUrl(body.url);
        return;
      }

      if (opts.nativeUri) {
        // ---- NATIVE: use expo-file-system uploadAsync ----
        const res = await FileSystem.uploadAsync(url, opts.nativeUri, {
          httpMethod: 'POST',
          headers: {
            ...headers,
            'Content-Type': contentTypeFromName(opts.nativeUri),
          },
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        });

        if (res.status !== 200) {
          console.error('Upload failed:', res.status, res.body);
          Alert.alert('Upload error', `Failed with ${res.status}`);
          return;
        }
        const body = JSON.parse(res.body);
        setMediaUrl(body.url);
        return;
      }

      Alert.alert('Error', 'No file selected.');
    } catch (error) {
      console.error('Error uploading image (binary):', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  }

  // ---------- Form helpers ----------

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim().replace('#', '')]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const createPersonalPost = async () => {
    if (!mediaUrl || !description.trim()) {
      Alert.alert('Missing Information', 'Please select an image and add a description.');
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const requestBody = {
        description: description.trim(),
        media: [{ url: mediaUrl, media_type: 'image' }],
      };

      await axios.post(`${API_URL}/posts`, requestBody, {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });

      Alert.alert('Success', 'Personal post created successfully!', [
        { text: 'OK', onPress: () => { resetForm(); onClose(); } }
      ]);
      handleClose();
    } catch (error) {
      console.error('Create personal post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createCreatorPost = async () => {
    if (!mediaUrl || !description.trim() || !selectedCategory) {
      Alert.alert('Missing Information', 'Please select an image, category, and add a description.');
      return;
    }

    try {
      setLoading(true);
      const headers = await getAuthHeaders();

      const requestBody = {
        category_id: selectedCategory.id,
        reference_id: selectedReference?.id || null,
        description: description.trim(),
        category_tag_names: [],
        hashtag_names: hashtags,
        media: [{ url: mediaUrl, media_type: 'image' }],
      };

      await axios.post(`${API_URL}/creator-posts`, requestBody, {
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      handleClose();
      Alert.alert('Success', 'Creator post created successfully!', [
        { text: 'OK', onPress: () => { resetForm(); onClose(); } }
      ]);

    } catch (error) {
      console.error('Create creator post error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(undefined);
    setMediaUrl('');
    setWebFile(null);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const filteredReferences = references.filter(reference =>
    reference.title.toLowerCase().includes(referenceSearchQuery.toLowerCase())
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedCategory(item);
        setCategorySearchQuery(item.name);
        setShowCategoryDropdown(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderReferenceItem = ({ item }: { item: Reference }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedReference(item);
        setReferenceSearchQuery(item.title);
        setShowReferenceDropdown(false);
      }}
    >
      <View style={styles.referenceItem}>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.referenceImage} />
        )}
        <View style={styles.referenceInfo}>
          <Text style={styles.referenceTitle}>{item.title}</Text>
          <Text style={styles.referenceDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
                  {uploadingImage && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#fff" size="large" />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close-circle" size={30} color="#ff4757" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {Platform.OS === 'web' ? (
                    <>
                      {/* Web file input (hidden) */}
                      {/* @ts-ignore: web-only element */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={onWebFileChange}
                      />
                      <TouchableOpacity style={styles.imagePlaceholder} onPress={clickWebPicker}>
                        <Ionicons name="images-outline" size={50} color={Colors.light.textPurple} />
                        <Text style={styles.placeholderText}>Click to select image</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.selectButton} onPress={clickWebPicker}>
                        <Text style={styles.selectButtonText}>Choose from Files</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImageNative}>
                        <Ionicons name="camera-outline" size={50} color={Colors.light.textPurple} />
                        <Text style={styles.placeholderText}>Tap to select image</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.selectButton} onPress={pickImageNative}>
                        <Text style={styles.selectButtonText}>Choose from Gallery</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>

            {/* Post Type Selection */}
            {mediaUrl && !postType && (
              <View style={styles.postTypeSection}>
                <Text style={styles.sectionTitle}>Choose Post Type</Text>
                <View style={styles.postTypeButtons}>
                  <TouchableOpacity
                    style={styles.postTypeButton}
                    onPress={() => setPostType('personal')}
                  >
                    <Ionicons name="person-outline" size={24} color={Colors.light.textPurple} />
                    <Text style={styles.postTypeText}>Personal Post</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.postTypeButton}
                    onPress={() => setPostType('creator')}
                  >
                    <Ionicons name="create-outline" size={24} color={Colors.light.textPurple} />
                    <Text style={styles.postTypeText}>Creator Post</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Form Fields */}
            {postType && (
              <View style={styles.formSection}>
                {/* Creator Post Fields */}
                {postType === 'creator' && (
                  <>
                    {/* Category Selection */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Category *</Text>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      >
                        <TextInput
                          style={styles.dropdownInput}
                          value={categorySearchQuery}
                          onChangeText={setCategorySearchQuery}
                          placeholder="Search categories..."
                          placeholderTextColor={Colors.light.referenceText}
                          onFocus={() => setShowCategoryDropdown(true)}
                        />
                        <Ionicons name="chevron-down" size={20} color={Colors.light.textPurple} />
                      </TouchableOpacity>
                      {showCategoryDropdown && (
                        <View style={styles.dropdown}>
                          <FlatList
                            data={filteredCategories}
                            renderItem={renderCategoryItem}
                            keyExtractor={(item) => item.id}
                            style={styles.dropdownList}
                            nestedScrollEnabled
                          />
                        </View>
                      )}
                    </View>

                    {/* Reference Selection */}
                    {selectedCategory && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Reference (Optional)</Text>
                        <TouchableOpacity
                          style={styles.dropdownButton}
                          onPress={() => setShowReferenceDropdown(!showReferenceDropdown)}
                        >
                          <TextInput
                            style={styles.dropdownInput}
                            value={referenceSearchQuery}
                            onChangeText={setReferenceSearchQuery}
                            placeholder="Search references..."
                            placeholderTextColor={Colors.light.referenceText}
                            onFocus={() => setShowReferenceDropdown(true)}
                          />
                          <Ionicons name="chevron-down" size={20} color={Colors.light.textPurple} />
                        </TouchableOpacity>
                        {showReferenceDropdown && (
                          <View style={styles.dropdown}>
                            <FlatList
                              data={filteredReferences}
                              renderItem={renderReferenceItem}
                              keyExtractor={(item) => item.id}
                              style={styles.dropdownList}
                              nestedScrollEnabled
                            />
                          </View>
                        )}
                      </View>
                    )}

                    {/* Hashtags */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Hashtags (Optional)</Text>
                      <View style={styles.hashtagContainer}>
                        <TextInput
                          style={styles.hashtagInput}
                          value={hashtagInput}
                          onChangeText={setHashtagInput}
                          placeholder="Add hashtag and press Enter"
                          placeholderTextColor={Colors.light.referenceText}
                          onSubmitEditing={addHashtag}
                          returnKeyType="done"
                        />
                        <TouchableOpacity style={styles.addHashtagButton} onPress={addHashtag}>
                          <Ionicons name="add" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                      {hashtags.length > 0 && (
                        <View style={styles.hashtagList}>
                          {hashtags.map((hashtag, index) => (
                            <View key={index} style={styles.hashtagTag}>
                              <Text style={styles.hashtagText}>#{hashtag}</Text>
                              <TouchableOpacity onPress={() => removeHashtag(index)}>
                                <Ionicons name="close" size={16} color={Colors.light.textPurple} />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                )}

                {/* Description */}
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
              </View>
            )}

            {/* Create Button */}
            {postType && (
              <TouchableOpacity
                style={[
                  styles.createButton,
                  (!mediaUrl || !description.trim() || (postType === 'creator' && !selectedCategory) || loading) && styles.disabledButton
                ]}
                onPress={postType === 'personal' ? createPersonalPost : createCreatorPost}
                disabled={!mediaUrl || !description.trim() || (postType === 'creator' && !selectedCategory) || loading}
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
                    <Text style={styles.createButtonText}>
                      Create {postType === 'personal' ? 'Personal' : 'Creator'} Post
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  content: { padding: 20 },
  imageSection: { marginBottom: 30, alignItems: 'center' },
  imagePlaceholder: {
    width: '100%', height: 200, backgroundColor: Colors.light.referenceBack, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.light.iconLight,
    borderStyle: 'dashed', marginBottom: 15,
  },
  placeholderText: { marginTop: 10, color: Colors.light.textPurple, fontSize: 16 },
  selectedImageContainer: { position: 'relative', width: '100%', height: 250, borderRadius: 16, overflow: 'hidden', marginBottom: 15 },
  selectedImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center' },
  uploadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  removeImageButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 15 },
  selectButton: { backgroundColor: Colors.light.gradientBlue, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  selectButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  postTypeSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.light.textPurple, marginBottom: 15 },
  postTypeButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  postTypeButton: {
    flex: 1, backgroundColor: Colors.light.referenceBack, borderRadius: 12, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.light.iconLight,
  },
  postTypeText: { marginTop: 8, fontSize: 16, fontWeight: '500', color: Colors.light.textPurple },
  formSection: { marginBottom: 30 },
  inputGroup: { marginBottom: 20, position: 'relative', },
  label: { fontSize: 16, fontWeight: '600', color: Colors.light.textPurple, marginBottom: 8 },
  input: { backgroundColor: Colors.light.referenceBack, borderRadius: 12, padding: 15, fontSize: 16, color: Colors.light.textPurple, borderWidth: 1, borderColor: Colors.light.iconLight },
  textArea: { height: 100, textAlignVertical: 'top' },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.referenceBack, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.iconLight, paddingRight: 15 },
  dropdownInput: { flex: 1, padding: 15, fontSize: 16, color: Colors.light.textPurple },
  dropdown: {
    // position: 'absolute', top: '100%', left: 0, right: 0, 
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: Colors.light.iconLight, maxHeight: 200, 
    zIndex: 1000, 
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4,
  },
  dropdownList: { maxHeight: 200 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: Colors.light.iconLight },
  dropdownItemText: { fontSize: 16, color: Colors.light.textPurple },
  referenceItem: { flexDirection: 'row', alignItems: 'center' },
  referenceImage: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  referenceInfo: { flex: 1 },
  referenceTitle: { fontSize: 16, fontWeight: '600', color: Colors.light.textPurple },
  referenceDescription: { fontSize: 14, color: Colors.light.referenceText, marginTop: 2 },
  hashtagContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.referenceBack, borderRadius: 12, borderWidth: 1, borderColor: Colors.light.iconLight },
  hashtagInput: { flex: 1, padding: 15, fontSize: 16, color: Colors.light.textPurple },
  addHashtagButton: { backgroundColor: Colors.light.gradientBlue, padding: 10, borderRadius: 8, marginRight: 10 },
  hashtagList: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  hashtagTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.gradientBlue, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, gap: 6 },
  hashtagText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  createButton: { borderRadius: 25, overflow: 'hidden', marginBottom: 30 },
  disabledButton: { opacity: 0.5 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  createButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
