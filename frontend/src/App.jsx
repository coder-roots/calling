import { useState } from 'react'
import './App.css'
import Nav from './components/Nav'
import {Outlet} from 'react-router-dom'
import Footer from './components/Footer'
import CssBaseline from '@mui/material/CssBaseline';

function App() {

  return (
    <>
      <Nav/>
      <Outlet/>
      <Footer/>
    </>
  )
}

export default App
