import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toolbar from './components/Toolbar';
import TabsBar from './components/TabsBar';
import WorkspaceLayout from './components/WorkspaceLayout';
import PracticeModal from './components/PracticeModal';
import MyProgramsModal from './components/MyProgramsModal';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import ShareModal from './components/ShareModal';
import Toast from './components/Toast';

// Upgraded Major Feature Components
import AiAssistantDrawer from './components/AiAssistantDrawer';
import StudentDashboardModal from './components/StudentDashboardModal';
import AdminDashboardModal from './components/AdminDashboardModal';

import { usePlayground } from './context/PlaygroundContext';
import { api } from './utils/api';

export default function App() {
  const { loadProgramIntoEditor, showToast } = usePlayground();

  // Modal & Drawer visibility states
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Upgraded Feature States
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Check URL parameters for shared code on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('shared');
    const b64Code = urlParams.get('code');

    if (sharedId) {
      api.getSharedProgram(sharedId)
        .then(res => {
          if (res.program) {
            loadProgramIntoEditor(res.program);
            showToast(`Loaded shared program "${res.program.title}" by ${res.program.author_name || 'Anonymous'}`, 'success');
          }
        })
        .catch(err => {
          showToast('Could not load shared program: ' + err.message, 'error');
        });
    } else if (b64Code) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(b64Code)));
        loadProgramIntoEditor(decoded);
        showToast(`Loaded shared program: "${decoded.title}"`, 'success');
      } catch (e) {
        // ignore invalid b64
      }
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0d1117] text-gray-100 overflow-hidden font-sans select-none">
      {/* 1. Top Navbar */}
      <Navbar
        onOpenPractice={() => setIsPracticeOpen(true)}
        onOpenPrograms={() => setIsProgramsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* 2. Language & Execution Toolbar */}
      <Toolbar
        onOpenSave={() => setIsProgramsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* 3. Open Tabs Bar */}
      <TabsBar />

      {/* 4. Advanced Multi-Layout Workspace with Draggable Splitters */}
      <WorkspaceLayout
        onOpenSave={() => setIsProgramsOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Feature 1: AI-Powered Coding Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />

      {/* Feature 2: Student Dashboard */}
      <StudentDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      {/* Feature 3: Centralized Global Question Bank & Admin Dashboard */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* Existing Global Modals */}
      <PracticeModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <MyProgramsModal
        isOpen={isProgramsOpen}
        onClose={() => setIsProgramsOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Notification Toast */}
      <Toast />
    </div>
  );
}
