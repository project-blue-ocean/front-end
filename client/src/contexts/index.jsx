import React, {
  useState, useEffect,
} from 'react';
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  arrayUnion,
  serverTimestamp,
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
  const [toastShowing, setToastShowing] = useState(false);
  const [toastMessage, setToastMessage] = useState('Success!');
  const [toastType, setToastType] = useState('success');

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
  function addProfile(body) {
    return setDoc(doc(db, 'profile', body.userId), body);
  }

  function getProfile(params) {
    const profRef = doc(db, 'profile', params);
    return getDoc(profRef);
  }

  function updateUsersContacted(id, params) {
    const usersContactedDoc = doc(db, 'profile', id);
    return updateDoc(usersContactedDoc, { usersContacted: arrayUnion(params) });
  }

  function getUser(params) {
    const docRef = doc(db, 'users', params);
    return getDoc(docRef);
  }

  // Rides
  function addRide(body) {
    return addDoc(ridesCollectionReference, body);
  }

  function getRides(start, destination) {
    const q = query(ridesCollectionReference, where('start', '==', start));
    return getDocs(q)
      .then((querySnapshot) => querySnapshot
        .docs
        .map((ride) => ride.data())
        .filter((ride) => !destination || ride.destination === destination));
    // TODO: handle queries w/ no start param
  }

  // Reviews
  function addReview(body) {
    return addDoc(reviewsCollectionReference, body);
  }

  function getReviews(params) {
    const q = query(collection(db, 'reviews'), where('receiverId', '==', params));
    return getDocs(q)
      .then((reviewsSnapshot) => {
        const reviews = [];
        reviewsSnapshot.forEach((review) => {
          reviews.push(review.data());
        });
        return reviews;
      });
  }

  // Messages
  function addMessage(body) {
    // eslint-disable-next-line no-param-reassign
    body.time = serverTimestamp();
    return addDoc(messagesCollectionReference, body);
  }

  function getMessages(params, callback) {
    const q = query(collection(db, 'messages'), orderBy('time'), where('chatd', 'array-contains', params));
    return onSnapshot(q, (querySnapshot) => {
      const messages = [];
      querySnapshot.forEach((docs) => {
        const message = docs.data();
        message.time = message.time === null ? new Date() : message.time.toDate();
        messages.push(message);
      });
      callback(messages);
    });
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
    addProfile,
    getUser,
    updateUsersContacted,
    addRide,
    getRides,
    addReview,
    getReviews,
    addMessage,
    getMessages,
    getContacts,
    getProfile,
    setToastShowing,
    setToastMessage,
    setToastType,
    toastShowing,
    toastMessage,
    toastType,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
