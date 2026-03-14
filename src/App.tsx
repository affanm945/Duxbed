// import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AboutUs from './pages/AboutUs';
import OurStory from './pages/OurStory';
import OurLeadership from './pages/OurLeadership';
import LeadershipProfile from './pages/LeadershipProfile';
import WhyDuxbed from './pages/WhyDuxbed';
import WhatWeDo from './pages/WhatWeDo';
import LocateUs from './pages/LocateUs';
import Careers from './pages/Careers';
import Media from './pages/Media';
import PartnerWithUs from './pages/PartnerWithUs';
import Contact from './pages/Contact';
import TrackOrder from './pages/TrackOrder';
import Index from './pages/Index';
import Product from './pages/Product';
import DuxpodExperience from './pages/DuxpodExperience';
import SpaceSavingFurniture from './pages/SpaceSavingFurniture';
import Duxpod from './pages/Duxpod';
import InteriorDesigning from './pages/InteriorDesigning';
import ModularKitchen from './pages/ModularKitchen';

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/our-leadership" element={<OurLeadership />} />
          <Route path="/our-leadership/:idOrSlug" element={<LeadershipProfile />} />
          <Route path="/why-duxbed" element={<WhyDuxbed />} />
          <Route path="/what-we-do" element={<WhatWeDo />} />
          <Route path="/locate-us" element={<LocateUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/media" element={<Media />} />
          <Route path="/partner-with-us" element={<PartnerWithUs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/space-saving-furniture" element={<SpaceSavingFurniture />} />
          <Route path="/duxpod-experience" element={<DuxpodExperience />} />
          <Route path="/duxpod" element={<Duxpod />} />
          <Route path="/interior-designing" element={<InteriorDesigning />} />
          <Route path="/modular-kitchen" element={<ModularKitchen />} />
          <Route path="/product" element={<Product />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
