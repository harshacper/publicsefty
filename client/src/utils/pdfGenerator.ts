import { jsPDF } from 'jspdf';
import { Complaint, PoliceStation } from '../types';

export const generateComplaintAcknowledgmentPDF = (complaint: Complaint) => {
  const doc = new jsPDF();
  const station = complaint.selectedPoliceStationId as PoliceStation;

  // Header background banner
  doc.setFillColor(11, 37, 69); // Dark navy blue #0b2545
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SMART POLICE CITIZEN SERVICES PORTAL', 105, 12, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('ELECTRONIC COMPLAINT INTIMATION & ACKNOWLEDGMENT RECEIPT', 105, 19, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(244, 208, 111); // Gold accent
  doc.text('GOVERNMENT OF INDIA / STATE POLICE DEPARTMENT CITIZEN FACILITATION', 105, 26, { align: 'center' });

  // Reset text color for body
  doc.setTextColor(30, 41, 59);

  // Tracking ID Highlight Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 38, 182, 20, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 37, 69);
  doc.text('COMPLAINT TRACKING ID:', 20, 46);

  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216); // Blue #1d4ed8
  doc.text(complaint.trackingId, 20, 54);

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('SUBMITTED DATE:', 120, 46);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(new Date(complaint.createdAt || complaint.submittedAt || Date.now()).toLocaleString(), 120, 54);

  // Section 1: Citizen Details
  let y = 68;
  doc.setFillColor(30, 58, 95);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('1. COMPLAINANT / CITIZEN INFORMATION', 18, y + 4.5);

  y += 12;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Full Name:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(complaint.fullName || 'N/A', 50, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Mobile No:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(complaint.phone || 'N/A', 150, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Age / Gender:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${complaint.age || 'N/A'} yrs / ${complaint.gender || 'N/A'}`, 50, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Email Address:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(complaint.email || 'N/A', 150, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Address:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const citizenAddress = `${complaint.address || ''}, ${complaint.city || ''}, ${complaint.state || ''} - ${complaint.pinCode || ''}`;
  doc.text(doc.splitTextToSize(citizenAddress, 130), 50, y);

  // Section 2: Incident & Complaint Information
  y += 13;
  doc.setFillColor(30, 58, 95);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('2. INCIDENT & COMPLAINT PARTICULARS', 18, y + 4.5);

  y += 12;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Complaint Title:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(complaint.complaintTitle, 50, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Crime Category:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Crimson
  doc.text(complaint.category, 50, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Incident Date/Time:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`${complaint.incidentDate} at ${complaint.incidentTime}`, 155, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Incident Location:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(complaint.incidentLocation, 130), 50, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('GPS Coordinates:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Lat: ${complaint.incidentLatitude?.toFixed(5)}, Lng: ${complaint.incidentLongitude?.toFixed(5)}`, 50, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Description:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const descLines = doc.splitTextToSize(complaint.description, 135);
  doc.text(descLines.slice(0, 4), 50, y);

  // Section 3: Police Station & Jurisdiction
  y += Math.min(descLines.length, 4) * 4.5 + 8;
  doc.setFillColor(30, 58, 95);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('3. ASSIGNED POLICE STATION & JURISDICTION', 18, y + 4.5);

  y += 12;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Station Name:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(station?.stationName || 'Assigned Police Station', 50, y);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Station Code:', 120, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(station?.stationCode || 'N/A', 150, y);

  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Station Address:', 18, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(station?.address || 'Local Police Post', 130), 50, y);

  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Contact Helpline:', 18, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(station?.contactNumber || '112 / 100', 50, y);

  // Section 4: Current Status & Notice
  y += 13;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(14, y, 182, 24, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('IMPORTANT LEGAL NOTICE:', 18, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(127, 29, 29);
  const legalNotice =
    'This acknowledgment is generated upon electronic registration and submission. It represents an authorized preliminary report for administrative processing and jurisdictional review. It does NOT constitute a registered FIR (First Information Report) under Section 154 CrPC until reviewed and admitted by the Station House Officer.';
  doc.text(doc.splitTextToSize(legalNotice, 172), 18, y + 12);

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Smart Police Complaint Management System • Generated on: ${new Date().toISOString()} • Citizen Tracking ID: ${complaint.trackingId}`,
    105,
    285,
    { align: 'center' }
  );

  doc.save(`Complaint_Acknowledgment_${complaint.trackingId}.pdf`);
};
