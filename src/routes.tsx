import type { ReactNode } from 'react';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Learn from '@/pages/Learn';
import TopicDetail from '@/pages/TopicDetail';
import Practice from '@/pages/Practice';
import Test from '@/pages/Test';
import TestConfig from '@/pages/TestConfig';
import TestInstructions from '@/pages/TestInstructions';
import TestWindow from '@/pages/TestWindow';
import TestResults from '@/pages/TestResults';
import Admin from '@/pages/Admin';
import About from '@/pages/About';
import SharedReport from '@/pages/SharedReport';
import WrongAnswers from '@/pages/WrongAnswers';

// Importing the new Setup component and keeping Update
import SetupPassword from '@/components/common/SetupPassword'; 
 

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  requiresAuth?: boolean;
  adminOnly?: boolean;
  allowedRoles?: string[];
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/',
    element: <Login />,
    requiresAuth: false
  },
  {
    name: 'Home',
    path: '/home',
    element: <Home />,
    requiresAuth: true
  },
  {
    name: 'Setup Password',
    path: '/setup-password',
    element: <SetupPassword />,
    requiresAuth: true // User is technically auth'd with aptix123
  },
  {
    name: 'Learn',
    path: '/learn',
    element: <Learn />,
    requiresAuth: true
  },
  {
    name: 'Topic Detail',
    path: '/learn/:slug',
    element: <TopicDetail />,
    requiresAuth: true
  },
  {
    name: 'Practice',
    path: '/practice/:slug',
    element: <Practice />,
    requiresAuth: true
  },
  {
    name: 'Test',
    path: '/test',
    element: <Test />,
    requiresAuth: true
  },
  {
    name: 'Test Config',
    path: '/test/:slug',
    element: <TestConfig />,
    requiresAuth: true
  },
  {
    name: 'Test Instructions',
    path: '/test/:slug/instructions',
    element: <TestInstructions />,
    requiresAuth: true
  },
  {
    name: 'Test Window',
    path: '/test/:slug/start',
    element: <TestWindow />,
    requiresAuth: true
  },
  {
    name: 'Test Results',
    path: '/test/results',
    element: <TestResults />,
    requiresAuth: true
  },
  {
    name: 'Wrong Answers',
    path: '/test/wrong-answers',
    element: <WrongAnswers />,
    requiresAuth: true
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <Admin />,
    requiresAuth: true,
    allowedRoles: ['admin', 'staff']
  },
  {
    name: 'About',
    path: '/about',
    element: <About />,
    requiresAuth: false
  },
  {
    name: 'Shared Report',
    path: '/shared/:shareId',
    element: <SharedReport />,
    requiresAuth: false
  }
];

export default routes;