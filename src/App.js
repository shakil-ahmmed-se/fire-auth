import logo from './logo.svg';
import './App.css';
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, FacebookAuthProvider, getAuth, signInWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import firebaseConfig from './firebase.config';
import { GoogleAuthProvider } from "firebase/auth";
import { useState } from 'react';



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: '',
    email: '',
    photo: '',
    error:'',
    password:'',
    success: false,
  })

  const googleProvider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();
  const handleSignIn =() =>{
    signInWithPopup(auth, googleProvider)
     .then((res) => {
       // The signed-in user info.
        const {displayName, photoURL, email} = res.user;
        const signInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        }

        setUser(signInUser);

        console.log(displayName, photoURL, email)
     })
     .catch((error) => {
       console.error(error);
       console.log(error.message);
     });
  }

  const handleSignOut = () => {
     auth.signOut()
     .then((res)=>{
       setUser({
         isSignIn: false,
         name: '',
         email: '',
         password:'',
         photo: '',
       })
       console.log('User signed out');
     })
     .catch((error) => {
       console.error(error);
       console.log(error.message);
     });
  }

  const handleChange = (e) => {
    // console.log()
    let IsFieldValid = true;
    // console.log(e.target.name , e.target.value);
    if(e.target.name === 'email'){
      IsFieldValid = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(e.target.value);
    
    }
    if(e.target.name === 'password'){
     IsFieldValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/i.test(e.target.value);
    
    }
    if(IsFieldValid){
      const newUserInfo = {...user};
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
      // console.log(newUserInfo);
    }

  }
    
  const handleSubmit = (e) => {
    console.log(user.email, user.password)
      if(newUser && user.email && user.password){
        const auth = getAuth();
        createUserWithEmailAndPassword(auth, user.email, user.password)
          .then((res) => {
            const newUserInfo = {...user};
            newUserInfo.error = '';
            newUserInfo.success = true;
            setUser(newUserInfo);
            updateUserName(user.name)
            
          })
          .catch((error) => {
            const newUserInfo = {...user};
            newUserInfo.error = error.message;
            newUserInfo.isSignIn = false;
            setUser(newUserInfo);
          });
      }
      if(!newUser && user.email && user.password){

        const auth = getAuth();
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = {...user};
          newUserInfo.error = '';
          newUserInfo.success = true;
          // user.isSignIn = true;
          setUser(newUserInfo);
          console.log('sign in user: ',res);
        })
        .catch((error) => {
          const newUserInfo = {...user};
          newUserInfo.error = error.message;
          // user.isSignIn = false;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
      }
      e.preventDefault();
  }

  const updateUserName = (name)=>{
      const auth = getAuth();
      updateProfile(auth.currentUser, {
        displayName: name
      }).then(() => {
        console.log('user name updated')
      }).catch((error) => {
        console.log(error)
      });
  }
  
  const handleFbSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        // The signed-in user info.
        const users = result.user;
        const signInUser = {
          isSignIn: true,
        }
        setUser(signInUser);
        

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        console.log('fb user data',users)

        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = FacebookAuthProvider.credentialFromError(error);
        console.log(errorMessage)

        // ...
      });
  }

  return (
    <div className="App">
     {
      user.isSignIn ?   <button onClick={handleSignOut}>Sign Out</button> : <button onClick={handleSignIn}>Sign In</button>
     }
     <br />
     <button onClick={handleFbSignIn}>Sign In using Facebook</button>
      {
        user.isSignIn && (
          <div>
            <h1>Welcome, {user.name}</h1>
            <img src={user.photo} alt="User Profile" />
            <p>{user.email}</p>
          </div>
        )
       
      }

      <h1>Our Own Authentiaction</h1>
      <input type="checkbox" onChange={()=> setNewUser(!newUser)} name="New User" id="NewUser" />
      <label htmlFor="NewUser">New User</label>
      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" placeholder="Name" name='name' onBlur={handleChange} required />
        }
        <br />
        <input type="email" name='email' onBlur={handleChange} placeholder="Email" required /><br />
        <input type="password" name='password' onBlur={handleChange} placeholder="Password" required /><br />
        <input type="submit" value="Submit" />

      </form>
      {
        user.success && <p style={{color:'green'}}>User Submit successfully.</p>
      }
      {
        user.error && <p style={{color:'red'}}>{user.error}</p>
      }

    </div>
  );
}

export default App;
