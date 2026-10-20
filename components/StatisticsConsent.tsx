'use client';
import {useEffect} from 'react';
export function StatisticsConsent(){useEffect(()=>{if(document.getElementById('business-statistics-script'))return;const s=document.createElement('script');s.id='business-statistics-script';s.src='/measurement.js';s.dataset.brand='rruk';s.defer=true;document.body.appendChild(s);},[]);return null;}
