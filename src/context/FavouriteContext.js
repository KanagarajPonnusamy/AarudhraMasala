/**
 * Created by: Kanagaraj P
 * Created on: 04-03-2026
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const FavouriteContext = createContext();

export function FavouriteProvider({ children }) {
  const [favourites, setFavourites] = useState([]);

  const addToFavourites = useCallback((product) => {
    setFavourites((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromFavourites = useCallback((productId) => {
    setFavourites((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const toggleFavourite = useCallback((product) => {
    setFavourites((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const isFavourite = useCallback(
    (productId) => favourites.some((item) => item.id === productId),
    [favourites]
  );

  const favouriteCount = favourites.length;

  return (
    <FavouriteContext.Provider
      value={{
        favourites,
        favouriteCount,
        addToFavourites,
        removeFromFavourites,
        toggleFavourite,
        isFavourite,
      }}
    >
      {children}
    </FavouriteContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouriteContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouriteProvider');
  }
  return context;
}
