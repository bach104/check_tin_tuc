/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/footer';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Outlet /> {/* Các component con sẽ được render ở đây dựa vào router */}
      <Footer />
    </div>
  );
}