import { db } from "../_utils/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

// Ensure the user document exists in the Firestore database
async function ensureUserDocument(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error ensuring user document:", error);
    throw error;
  }
}

// Get all the items (books) that the user has added to their favorites
export const getItems = async (userId) => {
  try {
    await ensureUserDocument(userId);
    const itemsCollectionRef = collection(db, "users", userId, "items");
    const itemsSnapshot = await getDocs(itemsCollectionRef);
    const itemsList = itemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return itemsList;
  } catch (fetchItemsError) {
    console.error("Error in fetchItemsError: ", fetchItemsError);
    throw fetchItemsError;
  }
};

// Add a new item (book) to the user's favorites
export async function addItem(userId, item) {
  try {
    await ensureUserDocument(userId);
    const itemsCollectionRef = collection(db, "users", userId, "items");
    const docRef = await addDoc(itemsCollectionRef, {
      ...item,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (addItemError) {
    console.error("Error in addItemError: ", addItemError);
    throw addItemError;
  }
}

// Remove an item (book) from the user's favorites
export async function deleteItem(userId, itemId) {
  try {
    await ensureUserDocument(userId);
    const itemDocRef = doc(db, "users", userId, "items", itemId);
    await deleteDoc(itemDocRef);
    return true;
  } catch (deleteItemError) {
    console.error("Error in deleteItemError: ", deleteItemError);
    throw deleteItemError;
  }
}

// Check if a book is already in the user's favorites
export async function checkIsFavorite(userId, bookKey) {
  try {
    await ensureUserDocument(userId);
    const itemsCollectionRef = collection(db, "users", userId, "items");
    const itemsSnapshot = await getDocs(itemsCollectionRef);
    return itemsSnapshot.docs.some((doc) => doc.data().key === bookKey);
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
}

// Get the ID of the favorite record for a specific book
export async function getFavoriteId(userId, bookKey) {
  try {
    await ensureUserDocument(userId);
    const itemsCollectionRef = collection(db, "users", userId, "items");
    const itemsSnapshot = await getDocs(itemsCollectionRef);
    const doc = itemsSnapshot.docs.find((doc) => doc.data().key === bookKey);
    return doc ? doc.id : null;
  } catch (error) {
    console.error("Error getting favorite id:", error);
    return null;
  }
}