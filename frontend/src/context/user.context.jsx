import React, { createContext, useContext, useState } from 'react';
// user context.jsx is created to manage user state across the application
// Create the context
 export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};


