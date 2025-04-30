import React from 'react';
import { UserProvider } from './context/user.context.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

function App() {
  return (
     <UserProvider>
          <AppRoutes/>
     </UserProvider>
  );
}

export default App;