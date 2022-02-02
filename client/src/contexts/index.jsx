import React, {
  useState, useEffect,
} from 'react';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  doc,
} from '@firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateprofile,
} from 'firebase/auth';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

const ridesCollectionReference = collection(db, 'rides');
const reviewsCollectionReference = collection(db, 'reviews');
const messagesCollectionReference = collection(db, 'messages');
const contactsCollectionReference = collection(db, 'contacts');

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  // Authorization
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function updateProfile(updatesObj) {
    const user = auth.currentUser;
    return updateprofile(user, updatesObj);
  }

  function uploadAvatar(uid, file) {
    const storageRef = ref(storage, `users/${uid}/${file.name}`);
    return uploadBytes(storageRef, file).then(() => getDownloadURL(ref(storage, `users/${uid}/${file.name}`)));
  }

  // User
  function createUser(body) {
    return addDoc(collection(db, 'users'), body);
  }

  function updateUser(body) {
    const userDoc = doc(db, 'users', body.id);
    return updateDoc(userDoc, body);
  }

  function getUser(params) {
    const docRef = doc(db, 'users', params);
    return getDoc(docRef);
  }

  // Rides
  function addRide(body) {
    return addDoc(ridesCollectionReference, body);
  }

  function getRides(params) {
    return getDoc(ridesCollectionReference, params);
  }

  // Reviews
  function addReview(body) {
    return addDoc(reviewsCollectionReference, body);
  }

  function getReviews(params) {
    return getDocs(reviewsCollectionReference, params);
  }

  // Messages
  function addMessage(body) {
    return addDoc(messagesCollectionReference, body);
  }

  function getMessages(params) {
    return getDocs(messagesCollectionReference, params);
  }

  function getContacts(params) {
    return getDocs(contactsCollectionReference, params);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    updateProfile,
    uploadAvatar,
    createUser,
    getUser,
    updateUser,
    addRide,
    getRides,
    addReview,
    getReviews,
    addMessage,
    getMessages,
    getContacts,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
