import React, { createContext, useState, useContext } from 'react';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [currentBackground, setCurrentBackground] = useState('home');

  const backgrounds = {
    home: 'https://source.unsplash.com/1920x1080/?office,workspace,professional',
    profile: 'https://source.unsplash.com/1920x1080/?minimal,gradient,abstract',
    community: 'https://source.unsplash.com/1920x1080/?team,collaboration,meeting',
    career: 'https://source.unsplash.com/1920x1080/?data,analytics,technology',
    jobs: 'https://source.unsplash.com/1920x1080/?corporate,business,office',
    events: 'https://source.unsplash.com/1920x1080/?conference,seminar,auditorium',
    documents: 'https://source.unsplash.com/1920x1080/?documents,papers,business',
    about: 'https://source.unsplash.com/1920x1080/?innovation,future,technology',
  };

  const changeBackground = (page) => {
    setCurrentBackground(page);
  };

  return (
    <BackgroundContext.Provider value={{ currentBackground, backgrounds, changeBackground }}>
      {children}
    </BackgroundContext.Provider>
  );
};
