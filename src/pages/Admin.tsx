import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/db/supabase';
import { useToast } from '@/hooks/use-toast';
import { topicsApi, testAttemptsApi } from '@/db/api';
import type { Topic } from '@/types/types';
import {
  Shield,
  Download,
  Search,
  Filter,
  AlertCircle,
  Users,
  MoreHorizontal,
  Briefcase,
  Trash2,
  X,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  GraduationCap,
  Eraser,
  RefreshCw,
  Plus,
  Loader2,
  Fingerprint,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Label } from '@/components/ui/label';

// --- Types ---
interface UserProgressData {
  userId: string;
  username: string;
  email: string;
  registerNo: string;
  department: string;
  year: string;
  section: string;
  totalQuestionsSolved: number;
  totalCorrectAnswers: number;
  averageScore: number;
  weeklySolvedCount: number;
  weeklyHighestScore: number;
  weeklyAvgTimePerQuestion: number;
  lastActive: string;
  joinDate: string;
}

interface StaffData {
  id?: string | null;
  username: string;
  email: string;
  department: string | null;
  year: string | null;
  section: string | null;
  assigned_sections: { department: string; year: string; section: string; }[] | null;
}

interface TopicAnalytics {
  topicId: number;
  topicName: string;
  totalSolved: number;
  totalCorrect: number;
  totalWrong: number;
  totalTime: number;
  accuracy: number;
}

type SortField = 'username' | 'registerNo';
type SortOrder = 'asc' | 'desc';

export default function Admin() {
  const [userProgressData, setUserProgressData] = useState<UserProgressData[]>([]);
  const [filteredData, setFilteredData] = useState<UserProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');

  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: SortField, order: SortOrder }>({ field: 'username', order: 'asc' });

  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  // --- Modal States ---
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [staffToUpdate, setStaffToUpdate] = useState<StaffData | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
    username: '',
    email: '',
    registerNo: '',
    department: 'CSE',
    year: 'I',
    section: 'A'
  });

  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    username: '',
    email: '',
    staffId: '',
    department: 'CSE',
    year: 'I',
    section: 'A'
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<UserProgressData | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<TopicAnalytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const { toast } = useToast();
  const location = useLocation();

  const isManageStaffMode = location.hash === '#manage-staff';
  const allDepartments = ['All', 'CSE', 'BME', 'ECE', 'EEE', 'IT', 'MEC', 'MHT', 'AIDS', 'ChE'];
  const allYears = ['All', 'I', 'II', 'III', 'IV'];
  const allSections = ['All', 'A', 'B', 'C'];

  const formDepartments = allDepartments.filter(d => d !== 'All');
  const formYears = allYears.filter(y => y !== 'All');
  const formSections = allSections.filter(s => s !== 'All');

  // Unified Refresh Logic
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUserProgressData(), fetchStaffData(), fetchTopics()]);
    setTimeout(() => setIsRefreshing(false), 600);
    toast({ title: "Data Synced", description: "Records updated successfully." });
  };

  useEffect(() => {
    fetchUserProgressData();
    fetchStaffData();
    fetchTopics();
  }, [selectedDept, selectedYear, selectedSection, isManageStaffMode]);

  useEffect(() => {
    let result = [...userProgressData];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(u =>
        (u.username && u.username.toLowerCase().includes(lowerSearch)) ||
        (u.registerNo && u.registerNo.toLowerCase().includes(lowerSearch)) ||
        (u.email && u.email.toLowerCase().includes(lowerSearch))
      );
    }
    result.sort((a, b) => {
      const valA = (a[sortConfig.field] || '').toLowerCase();
      const valB = (b[sortConfig.field] || '').toLowerCase();
      if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredData(result);
  }, [searchTerm, userProgressData, sortConfig]);

  // --- Data Fetching ---

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    return sortConfig.order === 'asc' ? <SortAsc className="h-3 w-3 ml-1 text-primary" /> : <SortDesc className="h-3 w-3 ml-1 text-primary" />;
  };

  const fetchTopics = async () => {
    try {
      const data = await topicsApi.getAll();
      setTopics(data);
    } catch (e) {
      console.error("Error fetching topics", e);
    }
  };

  const fetchStaffData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'staff')
        .order('username', { ascending: true });
      if (error) throw error;
      setStaffData(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchUserProgressData = async () => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setCurrentUserProfile(profile);

      let users: any[] = [];

      if (profile?.role === 'staff') {
        const assignedSections = (profile as any).assigned_sections || [];
        console.log('Staff Profile Logged In:', { email: profile.email, assignedSections });

        const sectionsToQuery: { department: string; year: string; section: string; }[] = [];
        const seen = new Set();

        if (Array.isArray(assignedSections)) {
          assignedSections.forEach((s: any) => {
            const dept = (s.department || '').trim();
            const year = (s.year || '').trim();
            const sec = (s.section || '').trim();
            if (dept && year && sec) {
              const key = `${dept}-${year}-${sec}`;
              if (!seen.has(key)) {
                sectionsToQuery.push({ department: dept, year: year, section: sec });
                seen.add(key);
              }
            }
          });
        }

        // Fallback to legacy
        const legacyDept = (profile.department ?? '').trim();
        const legacyYr = (profile.year ?? '').trim();
        const legacySec = (profile.section ?? '').trim();

        if (legacyDept && legacyYr && legacySec) {
          const key = `${legacyDept}-${legacyYr}-${legacySec}`;
          if (!seen.has(key)) {
            sectionsToQuery.push({ department: legacyDept, year: legacyYr, section: legacySec });
            seen.add(key);
          }
        }

        if (sectionsToQuery.length === 0) {
          console.warn('No sections found to query for staff.');
          toast({ title: "No Assignments", description: "You don't have any classes assigned to you yet.", variant: "destructive" });
          setUserProgressData([]);
          setLoading(false);
          return;
        }

        // Fetch all students the staff is allowed to see (RLS handles the heavy lifting)
        const { data: allAccessibleStudents, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'user')
          .order('username', { ascending: true });

        if (fetchError) {
          console.error('Error fetching students:', fetchError);
          throw fetchError;
        }

        console.log(`Total students accessible to staff: ${allAccessibleStudents?.length || 0}`);

        // Filter in memory for perfect accuracy and isolation
        users = (allAccessibleStudents || []).filter(student => {
          // 1. First check if student belongs to ANY of staff's assigned sections
          const isAssigned = sectionsToQuery.some(criteria => {
            const matchLegacy =
              (student.department === criteria.department) &&
              (student.year === criteria.year) &&
              (student.section === criteria.section);

            const matchAssigned = Array.isArray(student.assigned_sections) &&
              student.assigned_sections.some((s: any) =>
                (s.department === criteria.department) &&
                (s.year === criteria.year) &&
                (s.section === criteria.section)
              );

            return matchLegacy || matchAssigned;
          });

          if (!isAssigned) return false;

          // 2. Apply isolation filters (Department, Year, Section) if selected
          if (selectedDept !== 'All' && student.department !== selectedDept) return false;
          if (selectedYear !== 'All' && student.year !== selectedYear) return false;
          if (selectedSection !== 'All' && student.section !== selectedSection) return false;

          return true;
        });
      }
      else if (profile?.role === 'admin') {
        let q = supabase.from('profiles').select('*').eq('role', 'user');
        if (selectedDept !== 'All') q = q.eq('department', selectedDept);
        if (selectedYear !== 'All') q = q.eq('year', selectedYear);
        if (selectedSection !== 'All') q = q.eq('section', selectedSection);
        const { data: adminUsers } = await q.order('username', { ascending: true });
        users = adminUsers || [];
      }

      const progressData = users.map((u: any) => ({
        userId: u.id,
        username: u.username,
        email: u.email,
        registerNo: u.register_no || 'N/A',
        department: u.department || 'N/A',
        year: u.year || 'N/A',
        section: u.section || 'N/A',
        totalQuestionsSolved: 0,
        totalCorrectAnswers: 0,
        averageScore: 0,
        weeklySolvedCount: 0,
        weeklyHighestScore: 0,
        weeklyAvgTimePerQuestion: 0,
        lastActive: new Date().toISOString(),
        joinDate: u.created_at
      }));

      setUserProgressData(progressData);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setIsInitialLoad(false);
    }
  };

  const handleViewStudent = async (student: UserProgressData) => {
    if (!student.userId) {
      toast({ title: "Profile Pending", description: "This student hasn't logged in yet.", variant: "default" });
      return;
    }
    setSelectedStudent(student);
    setDetailModalOpen(true);
    setAnalyticsLoading(true);
    setActiveMenuIndex(null);

    try {
      const attempts = await testAttemptsApi.getUserAttempts(student.userId);
      const statsMap: Record<number, TopicAnalytics> = {};

      topics.forEach(topic => {
        statsMap[topic.id] = {
          topicId: topic.id, topicName: topic.name, totalSolved: 0, totalCorrect: 0, totalWrong: 0, totalTime: 0, accuracy: 0
        };
      });

      attempts.forEach(attempt => {
        if (statsMap[attempt.topic_id]) {
          const solved = attempt.total_questions || 0;
          const correct = attempt.score || 0;
          statsMap[attempt.topic_id].totalSolved += solved;
          statsMap[attempt.topic_id].totalCorrect += correct;
          statsMap[attempt.topic_id].totalWrong += (solved - correct);
          statsMap[attempt.topic_id].totalTime += (attempt.time_taken || 0);
        }
      });

      const finalStats = Object.values(statsMap).map(stat => ({
        ...stat,
        accuracy: stat.totalSolved > 0 ? Math.round((stat.totalCorrect / stat.totalSolved) * 100) : 0
      }));

      finalStats.sort((a, b) => b.totalSolved - a.totalSolved);
      setStudentAnalytics(finalStats);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load detailed analytics", variant: "destructive" });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const downloadWeeklyReport = async () => {
    setDownloading(true);
    try {
      if (!filteredData || filteredData.length === 0) {
        toast({ title: 'No Data', description: 'There are no students to export.' });
        setDownloading(false);
        return;
      }
      const allTopics = await topicsApi.getAll();
      const headers = ['Name', 'Register No', 'Email', 'Department', 'Year', 'Section', 'Overall Solved', 'Overall Correct', 'Overall Wrong', 'Overall Accuracy %', 'Total Time (min)'];
      allTopics.forEach(t => headers.push(`${t.name} Solved`, `${t.name} Correct`, `${t.name} Wrong`, `${t.name} Accuracy %`));
      const rowPromises = filteredData.map(async (student) => {
        if (!student.userId) return [student.username, student.registerNo, student.email, student.department, student.year, student.section, 0, 0, 0, '0%', '0'].join(',');
        const attempts = await testAttemptsApi.getUserAttempts(student.userId, 100);
        let totalSolved = 0, totalCorrect = 0, totalWrong = 0, totalTime = 0;
        const topicStats: Record<number, { solved: number, correct: number, wrong: number }> = {};
        allTopics.forEach(t => { topicStats[t.id] = { solved: 0, correct: 0, wrong: 0 }; });
        attempts.forEach(a => {
          const solved = a.total_questions || 0;
          const correct = a.score || 0;
          totalSolved += solved; totalCorrect += correct; totalWrong += (solved - correct); totalTime += (a.time_taken || 0);
          if (topicStats[a.topic_id]) {
            topicStats[a.topic_id].solved += solved;
            topicStats[a.topic_id].correct += correct;
            topicStats[a.topic_id].wrong += (solved - correct);
          }
        });
        const overallAccuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
        const totalTimeMin = (totalTime / 60).toFixed(1);
        const row = [`"${student.username || ''}"`, `"${student.registerNo || ''}"`, `"${student.email || ''}"`, `"${student.department || ''}"`, `"${student.year || ''}"`, `"${student.section || ''}"`, totalSolved, totalCorrect, totalWrong, `${overallAccuracy}%`, totalTimeMin];
        allTopics.forEach(t => {
          const stat = topicStats[t.id];
          const acc = stat.solved > 0 ? Math.round((stat.correct / stat.solved) * 100) : 0;
          row.push(stat.solved, stat.correct, stat.wrong, `${acc}%`);
        });
        return row.join(',');
      });
      const rows = await Promise.all(rowPromises);
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Detailed_Report_${selectedDept}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Success", description: "Report exported successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate report.", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  // --- Actions ---

  const openAssignModal = (staff: StaffData) => {
    setStaffToUpdate(staff);
    setTargetDept(staff.department || 'CSE');
    setTargetYear(staff.year || 'I');
    setTargetSection(staff.section || 'A');
    setAssignModalOpen(true);
    setActiveMenuIndex(null);
  };

  const handleAddAssignedSection = async () => {
    if (!staffToUpdate || !staffToUpdate.email || isAssigning) return;
    setIsAssigning(true);
    try {
      const currentSections = staffToUpdate.assigned_sections || [];
      // Check for duplicates
      if (currentSections.some(s => s.department === targetDept && s.year === targetYear && s.section === targetSection)) {
        toast({ title: 'Already Assigned', description: 'This section is already in the list.' });
        setIsAssigning(false);
        return;
      }

      const newSections = [...currentSections, { department: targetDept, year: targetYear, section: targetSection }];

      const { error } = await supabase
        .from('profiles')
        .update({
          assigned_sections: newSections,
          department: newSections[0]?.department || null,
          year: newSections[0]?.year || null,
          section: newSections[0]?.section || null
        })
        .eq('email', staffToUpdate.email);

      if (error) throw error;
      toast({ title: 'Success', description: 'Section added successfully.' });

      // Update local state to reflect changes in modal
      setStaffToUpdate({ ...staffToUpdate, assigned_sections: newSections });
      fetchStaffData();
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignedSection = async (index: number) => {
    if (!staffToUpdate || isAssigning) return;
    setIsAssigning(true);
    try {
      const currentSections = staffToUpdate.assigned_sections || [];
      const newSections = currentSections.filter((_, i) => i !== index);

      const { error } = await supabase
        .from('profiles')
        .update({
          assigned_sections: newSections,
          department: newSections.length > 0 ? newSections[0].department : null,
          year: newSections.length > 0 ? newSections[0].year : null,
          section: newSections.length > 0 ? newSections[0].section : null
        })
        .eq('email', staffToUpdate.email);

      if (error) throw error;
      toast({ title: 'Removed', description: 'Section removed successfully.' });

      setStaffToUpdate({ ...staffToUpdate, assigned_sections: newSections });
      fetchStaffData();
    } catch (error: any) {
      toast({ title: 'Update Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassignStaff = async (staffEmail: string) => {
    if (!confirm("Remove all class mappings for this staff member?")) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          assigned_sections: [],
          department: null,
          year: null,
          section: null
        })
        .eq('email', staffEmail);
      if (error) throw error;
      toast({ title: 'Unassigned', description: 'Staff mapping cleared.' });
      setActiveMenuIndex(null);
      setTimeout(() => fetchStaffData(), 300);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Are you sure? This removes the staff completely.")) return;
    try {
      const { error } = await supabase.rpc('delete_user_completely', { target_user_id: id });
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Staff removed.' });
      setActiveMenuIndex(null);
      fetchStaffData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Are you sure? This will permanently delete the student data.")) return;
    try {
      const { error } = await supabase.rpc('delete_user_completely', { target_user_id: id });
      if (error) throw error;
      toast({ title: 'Student Deleted', description: 'Student record removed.' });
      setActiveMenuIndex(null);
      fetchUserProgressData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!confirm("Reset password to 'aptix123'?")) return;
    try {
      const { error } = await supabase.rpc('reset_password_to_default', { target_user_id: id });
      if (error) throw error;
      toast({ title: 'Password Reset', description: "Password changed to 'aptix123'." });
      setActiveMenuIndex(null);
    } catch (error: any) {
      toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
    }
  };

  // --- Add User Functions ---

  const handleAddStudent = async () => {
    const { username, email, registerNo, department, year, section } = newStudentData;
    if (!username || !email || !registerNo) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setIsAddingStudent(true);
    try {
      const { error } = await supabase.rpc('create_new_student', {
        p_email: email.trim(),
        p_password: 'aptix123',
        p_username: username.trim(),
        p_register_no: registerNo.trim(),
        p_department: department,
        p_year: year,
        p_section: section
      });
      if (error) throw error;
      toast({ title: "Student Added", description: `${username} added successfully.` });
      setAddStudentModalOpen(false);
      setNewStudentData({ username: '', email: '', registerNo: '', department: 'CSE', year: 'I', section: 'A' });
      fetchUserProgressData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingStudent(false);
    }
  };

  const handleAddStaff = async () => {
    const { username, email, staffId, department, year, section } = newStaffData;
    if (!username || !email || !staffId) {
      toast({ title: "Missing Fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setIsAddingStaff(true);
    try {
      const { error } = await supabase.rpc('create_new_staff', {
        p_email: email.trim(),
        p_password: 'aptix123',
        p_username: username.trim(),
        p_staff_id: staffId.trim(),
        p_department: department,
        p_year: year,
        p_section: section
      });
      if (error) throw error;
      toast({ title: "Staff Added", description: `${username} added successfully.` });
      setAddStaffModalOpen(false);
      setNewStaffData({ username: '', email: '', staffId: '', department: 'CSE', year: 'I', section: 'A' });
      fetchStaffData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsAddingStaff(false);
    }
  };

  const [targetYear, setTargetYear] = useState('I');
  const [targetSection, setTargetSection] = useState('A');
  const [targetDept, setTargetDept] = useState('CSE');

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f7fa] animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 animate-ping bg-[#0f2e6e]/10 rounded-full" />
        <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white/50 backdrop-blur-xl">
          <Loader2 className="h-12 w-12 animate-spin text-[#0f2e6e]" />
        </div>
      </div>
      <p className="mt-8 font-black text-[#0f2e6e] uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Portal</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7fa] py-8 px-4 md:px-8 font-sans relative overflow-x-hidden" onClick={() => setActiveMenuIndex(null)}>
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[#0f2e6e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-[#ff7f0e]/5 rounded-full blur-[120px]" />
      </div>

      {/* ASSIGN MODAL - PREMIUM REDESIGN */}
      {assignModalOpen && staffToUpdate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f2e6e]/20 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => { setAssignModalOpen(false); setActiveMenuIndex(null); }}>
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(15,46,110,0.15)] w-full max-w-lg border border-white overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 bg-[#0f2e6e] relative overflow-hidden">
              <Sparkles className="absolute -right-8 -top-8 w-32 h-32 text-white/5 rotate-12" />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-[0.2em] mb-2">Manage Assignments</p>
                <h3 className="text-2xl font-black text-white tracking-tight">Manage Assignments</h3>
                <p className="text-blue-100/60 text-xs mt-1 font-medium italic">{staffToUpdate.username}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setAssignModalOpen(false); }}
                className="absolute top-8 right-8 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all z-[110] cursor-pointer"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Add New Assignment */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest">Add New Section</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Dept</label>
                    <select className="w-full h-10 border rounded-lg px-2 text-xs font-bold bg-white" value={targetDept} onChange={(e) => setTargetDept(e.target.value)}>
                      {formDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Year</label>
                    <select className="w-full h-10 border rounded-lg px-2 text-xs font-bold bg-white" value={targetYear} onChange={(e) => setTargetYear(e.target.value)}>
                      {formYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Sec</label>
                    <select className="w-full h-10 border rounded-lg px-2 text-xs font-bold bg-white" value={targetSection} onChange={(e) => setTargetSection(e.target.value)}>
                      {allSections.map(s => s !== 'All' && <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <Button onClick={handleAddAssignedSection} disabled={isAssigning} className="w-full bg-primary font-bold shadow-lg">
                  {isAssigning ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Add Assignment
                </Button>
              </div>

              {/* Current List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Active Assignments ({(staffToUpdate.assigned_sections || []).length})</h4>
                {(staffToUpdate.assigned_sections || []).length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <p className="text-sm text-slate-400 font-bold">No sections assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {staffToUpdate.assigned_sections?.map((section, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm group hover:border-primary/30 transition-all">
                        <div className="flex gap-2">
                          <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-[10px] font-black border border-orange-100">{section.department}</span>
                          <span className="bg-slate-50 text-slate-600 px-2 py-1 rounded text-[10px] font-black border border-slate-100">Year {section.year}</span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black border border-blue-100">Sec {section.section}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignedSection(idx)}
                          className="h-8 w-8 p-0 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t text-right">
              <Button variant="outline" className="font-bold px-8 rounded-xl" onClick={() => setAssignModalOpen(false)}>Done</Button>
            </div>
          </div>
        </div >
      )
      }

      {/* ADD STUDENT MODAL */}
      {
        addStudentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f2e6e]/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-[#0f2e6e] relative overflow-hidden">
                <Sparkles className="absolute -right-8 -top-8 w-32 h-32 text-white/5 rotate-12" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-[0.2em] mb-2">Add Student</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">Add New Student</h3>
                </div>
                <button onClick={() => setAddStudentModalOpen(false)} className="absolute top-8 right-8 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</label>
                    <Input placeholder="Full Name" value={newStudentData.username} onChange={(e) => setNewStudentData({ ...newStudentData, username: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Register Number</label>
                    <Input placeholder="Reg No" value={newStudentData.registerNo} onChange={(e) => setNewStudentData({ ...newStudentData, registerNo: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">College Email</label>
                  <Input type="email" placeholder="student@example.com" value={newStudentData.email} onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })} className="h-12 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dept</label>
                    <select className="w-full h-12 border rounded-xl px-3 text-xs font-bold bg-slate-50" value={newStudentData.department} onChange={(e) => setNewStudentData({ ...newStudentData, department: e.target.value })}>
                      {formDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Year</label>
                    <select className="w-full h-12 border rounded-xl px-3 text-xs font-bold bg-slate-50" value={newStudentData.year} onChange={(e) => setNewStudentData({ ...newStudentData, year: e.target.value })}>
                      {formYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sec</label>
                    <select className="w-full h-12 border rounded-xl px-3 text-xs font-bold bg-slate-50" value={newStudentData.section} onChange={(e) => setNewStudentData({ ...newStudentData, section: e.target.value })}>
                      {formSections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <Button className="w-full h-14 bg-[#0f2e6e] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-[#0f2e6e]/10" onClick={handleAddStudent} disabled={isAddingStudent}>
                  {isAddingStudent ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2 text-[#ff7f0e]" />} Register Student
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* ADD STAFF MODAL */}
      {
        addStaffModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f2e6e]/20 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-[#0f2e6e] relative overflow-hidden">
                <Sparkles className="absolute -right-8 -top-8 w-32 h-32 text-white/5 rotate-12" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-[0.2em] mb-2">Add Staff</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">Add New Staff</h3>
                </div>
                <button onClick={() => setAddStaffModalOpen(false)} className="absolute top-8 right-8 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Username</label>
                    <Input placeholder="Full Name" value={newStaffData.username} onChange={(e) => setNewStaffData({ ...newStaffData, username: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Staff ID</label>
                    <Input placeholder="Staff ID" value={newStaffData.staffId} onChange={(e) => setNewStaffData({ ...newStaffData, staffId: e.target.value })} className="h-12 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">College Email</label>
                  <Input type="email" placeholder="staff@college.edu" value={newStaffData.email} onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })} className="h-12 rounded-xl" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Dept</label>
                    <select className="w-full h-12 border rounded-xl px-3 text-xs font-bold bg-slate-50" value={newStaffData.department} onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}>
                      {formDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Year</label>
                    <select className="w-full h-12 border rounded-xl px-3 text-xs font-bold bg-slate-50" value={newStaffData.year} onChange={(e) => setNewStaffData({ ...newStaffData, year: e.target.value })}>
                      {formYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Sec</label>
                    <select className="w-full h-12 border rounded-xl px-3 text-xs font-bold bg-slate-50" value={newStaffData.section} onChange={(e) => setNewStaffData({ ...newStaffData, section: e.target.value })}>
                      {formSections.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <Button className="w-full h-14 bg-[#0f2e6e] text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-[#0f2e6e]/10" onClick={handleAddStaff} disabled={isAddingStaff}>
                  {isAddingStaff ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2 text-[#ff7f0e]" />} Add Staff
                </Button>
              </div>
            </div>
          </div>
        )
      }

      {/* ANALYTICS REPORT MODAL */}
      {
        detailModalOpen && selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f2e6e]/30 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(15,46,110,0.2)] w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
              <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-[#0f2e6e] flex items-center justify-center text-white shadow-xl shadow-[#0f2e6e]/20">
                    <Fingerprint className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-[#0f2e6e] tracking-tight">{selectedStudent.username}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-widest">{selectedStudent.registerNo}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <span className="text-blue-600">{selectedStudent.department}</span> {selectedStudent.year}-{selectedStudent.section}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setDetailModalOpen(false)} className="p-3 rounded-2xl bg-white border shadow-sm hover:bg-slate-50 transition-all">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8 lg:p-12">
                {analyticsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="absolute inset-0 animate-ping bg-[#0f2e6e]/5 rounded-full" />
                      <Loader2 className="h-12 w-12 animate-spin text-[#0f2e6e] relative z-10" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Loading Statistics...</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Total Solved', val: studentAnalytics.reduce((acc, curr) => acc + curr.totalSolved, 0), color: 'indigo', icon: BookOpen },
                        { label: 'Accuracy', val: `${Math.round(studentAnalytics.reduce((acc, curr) => acc + curr.totalCorrect, 0) / Math.max(1, studentAnalytics.reduce((acc, curr) => acc + curr.totalSolved, 0)) * 100)}%`, color: 'emerald', icon: CheckCircle2 },
                        { label: 'Total Time', val: formatTime(studentAnalytics.reduce((acc, curr) => acc + curr.totalTime, 0)), color: 'amber', icon: RefreshCw },
                        { label: 'Wrong Answers', val: studentAnalytics.reduce((acc, curr) => acc + curr.totalWrong, 0), color: 'rose', icon: XCircle }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group/stat relative overflow-hidden">
                          <div className={`absolute -right-2 -bottom-2 opacity-[0.03] group-hover/stat:opacity-[0.08] transition-all text-${stat.color}-900`}>
                            <stat.icon className="w-24 h-24 rotate-12" />
                          </div>
                          <p className={`text-[10px] font-black uppercase text-${stat.color}-500 tracking-widest mb-3`}>{stat.label}</p>
                          <p className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">{stat.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm bg-white">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Topic</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Solved</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Accuracy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {studentAnalytics.map((topic, idx) => (
                            <tr key={idx} className={`group hover:bg-slate-50/30 transition-all ${topic.totalSolved === 0 ? 'opacity-40' : ''}`}>
                              <td className="p-6">
                                <div className="font-black text-[#0f2e6e] text-base">{topic.topicName}</div>
                                <div className="flex gap-3 mt-1">
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded">{topic.totalCorrect} Correct</span>
                                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 rounded">{topic.totalWrong} Wrong</span>
                                </div>
                              </td>
                              <td className="p-6 text-center">
                                <span className="font-mono font-black text-slate-600 text-lg">{topic.totalSolved}</span>
                              </td>
                              <td className="p-6">
                                {topic.totalSolved > 0 ? (
                                  <div className="flex items-center gap-4">
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                      <div className={`h-full rounded-full transition-all duration-1000 ${topic.accuracy >= 80 ? 'bg-emerald-500' : topic.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${topic.accuracy}%` }} />
                                    </div>
                                    <span className="text-sm font-black text-slate-700 min-w-[3rem]">{topic.accuracy}%</span>
                                  </div>
                                ) : <span className="text-[10px] font-black text-slate-300 uppercase italic">No Data</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 bg-slate-50 border-t flex justify-end">
                <Button onClick={() => setDetailModalOpen(false)} className="h-14 px-10 bg-[#0f2e6e] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:scale-[1.02] shadow-xl shadow-[#0f2e6e]/10 active:scale-95 transition-all">Close Report</Button>
              </div>
            </div>
          </div>
        )
      }

      {/* DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        <div className="space-y-6">
          <Link to="/home">
            <Button variant="ghost" size="sm" className="gap-2 text-[#0f2e6e]/60 hover:text-[#0f2e6e] hover:bg-white/50 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest px-4 group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0f2e6e]/5 backdrop-blur-md rounded-full border border-[#0f2e6e]/10 mb-2">
                <Fingerprint className="h-3 w-3 text-[#ff7f0e]" />
                <span className="text-[9px] font-black text-[#0f2e6e] uppercase tracking-[0.2em]">{currentUserProfile?.role || 'Guest'} Portal</span>
              </div>
              <h1 className="text-4xl font-black flex items-center gap-3 text-[#0f2e6e] tracking-tight">
                {isManageStaffMode ? <Briefcase className="text-[#ff7f0e] h-8 w-8" /> : <Shield className="text-[#ff7f0e] h-8 w-8" />}
                {isManageStaffMode ? 'Manage Staff' : (currentUserProfile?.role === 'staff' ? 'Staff Dashboard' : 'Admin Dashboard')}
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-md leading-relaxed">
                {isManageStaffMode ? 'Manage staff and student class assignments.' : 'Monitor student progress and performance data.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {currentUserProfile?.role === 'admin' && (
                <div className="flex gap-3">
                  {isManageStaffMode ? (
                    <Button onClick={() => setAddStaffModalOpen(true)} className="gap-3 h-12 bg-[#0f2e6e] hover:scale-[1.02] shadow-xl shadow-[#0f2e6e]/20 transition-all active:scale-[0.98] rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-white">
                      <Plus className="h-4 w-4 text-[#ff7f0e]" /> Add Staff
                    </Button>
                  ) : (
                    <Button onClick={() => setAddStudentModalOpen(true)} className="gap-3 h-12 bg-[#0f2e6e] hover:scale-[1.02] shadow-xl shadow-[#0f2e6e]/20 transition-all active:scale-[0.98] rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest text-white">
                      <Plus className="h-4 w-4 text-[#ff7f0e]" /> Register Student
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-md shadow-sm border-white/50 hover:bg-[#0f2e6e]/5 transition-all group active:scale-90"
              >
                <RefreshCw className={`h-4 w-4 text-[#0f2e6e] ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </Button>

              {!isManageStaffMode && (
                <Button onClick={downloadWeeklyReport} disabled={downloading || filteredData.length === 0} className="gap-3 h-12 bg-white/70 backdrop-blur-md border border-white text-[#0f2e6e] hover:bg-white shadow-xl shadow-[#0f2e6e]/5 transition-all active:scale-[0.98] rounded-2xl px-6 font-black text-[10px] uppercase tracking-widest group">
                  <Download className="h-4 w-4 text-[#ff7f0e] group-hover:translate-y-0.5 transition-transform" /> {downloading ? 'Syncing...' : 'Download Report'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isManageStaffMode ? (
          <div className="space-y-4 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <Card className="rounded-[2.5rem] border-none shadow-[0_30px_60px_-15px_rgba(15,46,110,0.08)] bg-white/80 backdrop-blur-md overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-[#0f2e6e] tracking-tight">Staff List</CardTitle>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff Management</p>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-2xl border shadow-sm text-[10px] font-black text-[#0f2e6e] uppercase tracking-widest">
                    {staffData.length} Records Found
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/30 border-b border-slate-100">
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Staff Name</th>
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Assigned Classes</th>
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white/20">
                      {staffData.map((staff, index) => (
                        <tr key={staff.id || `staff-${index}`} className="hover:bg-white/80 transition-all group cursor-default">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-[#0f2e6e]/5 flex items-center justify-center text-[#0f2e6e] group-hover:bg-[#0f2e6e] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                                <Fingerprint className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="font-black text-[#0f2e6e] text-base tracking-tight">{staff.username}</div>
                                <div className="text-[11px] text-slate-400 font-bold tracking-tighter">{staff.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            {(staff.assigned_sections || []).length > 0 ? (
                              <div className="flex flex-wrap gap-2 max-w-xs">
                                {staff.assigned_sections?.slice(0, 3).map((section, idx) => (
                                  <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-xl text-[10px] font-black group-hover:scale-105 transition-all">
                                    <span className="text-[#ff7f0e]">{section.department}</span>
                                    <span className="text-slate-200 w-[1px] h-3 bg-slate-200"></span>
                                    <span className="text-[#0f2e6e] uppercase">{section.year}-{section.section}</span>
                                  </div>
                                ))}
                                {(staff.assigned_sections || []).length > 3 && (
                                  <span className="w-8 h-8 flex items-center justify-center text-[10px] font-black text-slate-400 bg-white px-2 py-1 rounded-xl border border-dashed border-slate-200">+{(staff.assigned_sections || []).length - 3}</span>
                                )}
                              </div>
                            ) : staff.department ? (
                              <div className="flex items-center gap-1.5 bg-white border border-slate-100 shadow-sm px-3 py-1.5 rounded-xl text-[10px] font-black w-fit">
                                <span className="text-[#ff7f0e]">{staff.department}</span>
                                <span className="text-slate-200 w-[1px] h-3 bg-slate-200"></span>
                                <span className="text-[#0f2e6e] uppercase">{staff.year}-{staff.section}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-slate-300 text-[10px] font-black uppercase tracking-widest bg-slate-50/50 px-4 py-2 rounded-xl border border-dashed">
                                <AlertCircle className="h-3 w-3" /> Unassigned
                              </div>
                            )}
                          </td>
                          <td className="p-8 text-right relative">
                            <button onClick={(e) => { e.stopPropagation(); setActiveMenuIndex(activeMenuIndex === index ? null : index); }} className="w-10 h-10 flex items-center justify-center hover:bg-[#0f2e6e]/5 text-slate-400 hover:text-[#0f2e6e] rounded-xl transition-all">
                              <MoreHorizontal className="h-6 w-6" />
                            </button>
                            {activeMenuIndex === index && (
                              <div className="absolute right-20 top-8 w-56 bg-white/90 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(15,46,110,0.2)] rounded-[1.5rem] border border-white z-[120] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={(e) => { e.stopPropagation(); openAssignModal(staff); }} className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#0f2e6e]/5 flex items-center gap-3 text-slate-600 hover:text-[#0f2e6e] transition-all border-b border-slate-50"><GraduationCap className="h-4 w-4" /> Manage Access</button>
                                {staff.department && (
                                  <button onClick={(e) => { e.stopPropagation(); handleUnassignStaff(staff.email); }} className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 flex items-center gap-3 text-amber-600 transition-all border-b border-slate-50"><Eraser className="h-4 w-4" /> Wipe Mapping</button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); if (staff.id) handleDeleteStaff(staff.id); }} className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 flex items-center gap-3 text-rose-600 transition-all"><Trash2 className="h-4 w-4" /> Delete Account</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-end">
              <div className="xl:col-span-5 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl group-focus-within:bg-[#0f2e6e]/5 transition-colors">
                  <Search className="h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                </div>
                <Input placeholder="Search students..." className="h-16 pl-16 pr-6 bg-white/80 backdrop-blur-md rounded-[1.8rem] border-2 border-transparent focus:border-[#0f2e6e]/10 shadow-[0_10px_30px_-5px_rgba(15,46,110,0.05)] font-black text-sm text-[#0f2e6e] placeholder:text-slate-300 outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              <div className="xl:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest leading-none">Department</Label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl group-focus-within:bg-[#0f2e6e]/5 transition-colors">
                      <Filter className="h-4 w-4 text-slate-400 group-focus-within:text-[#0f2e6e]" />
                    </div>
                    <select className="w-full h-14 pl-14 pr-6 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-transparent focus:border-[#0f2e6e]/10 shadow-[0_10px_30px_-5px_rgba(15,46,110,0.05)] font-black text-xs text-[#0f2e6e] outline-none transition-all appearance-none cursor-pointer" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                      {allDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest leading-none">Year</Label>
                  <select className="w-full h-14 px-6 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-transparent focus:border-[#0f2e6e]/10 shadow-[0_10px_30px_-5px_rgba(15,46,110,0.05)] font-black text-xs text-[#0f2e6e] outline-none transition-all appearance-none cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest leading-none">Section</Label>
                  <select className="w-full h-14 px-6 bg-white/80 backdrop-blur-md rounded-2xl border-2 border-transparent focus:border-[#0f2e6e]/10 shadow-[0_10px_30px_-5px_rgba(15,46,110,0.05)] font-black text-xs text-[#0f2e6e] outline-none transition-all appearance-none cursor-pointer" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                    {allSections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <Card className="rounded-[3rem] border-none shadow-[0_40px_100px_-20px_rgba(15,46,110,0.12)] bg-white/90 backdrop-blur-3xl overflow-hidden relative border border-white/50">
              <CardHeader className="bg-[#0f2e6e]/5 border-b border-white px-8 md:px-12 py-8 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-[#0f2e6e] tracking-tight">Student List</CardTitle>
                  <p className="text-[10px] font-black text-[#ff7f0e] uppercase tracking-[0.25em] mt-1">Student Analytics</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-5 py-2.5 bg-[#0f2e6e] rounded-full text-[11px] font-black text-white uppercase tracking-widest shadow-lg shadow-[#0f2e6e]/20">
                    {filteredData.length} Students
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/10 border-b border-slate-100">
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer group" onClick={() => handleSort('username')}>
                          <div className="flex items-center gap-2 group-hover:text-[#0f2e6e] transition-colors">Student Name {getSortIcon('username')}</div>
                        </th>
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer group" onClick={() => handleSort('registerNo')}>
                          <div className="flex items-center gap-2 group-hover:text-[#0f2e6e] transition-colors">Register Number {getSortIcon('registerNo')}</div>
                        </th>
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Class</th>
                        <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50">
                      {filteredData.map((u, index) => (
                        <tr key={u.userId || `user-${index}`} className="hover:bg-[#0f2e6e]/5 transition-all group cursor-default">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0f2e6e] group-hover:text-white transition-all scale-95 group-hover:scale-105 duration-300">
                                <Users className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-black text-[#0f2e6e] text-base group-hover:translate-x-1 transition-transform">{u.username}</div>
                                <div className="text-[10px] text-slate-400 font-bold tracking-tighter">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-8 font-mono text-sm font-black text-[#0f2e6e]/60">{u.registerNo}</td>
                          <td className="p-8">
                            <div className="flex items-center gap-1.5 bg-slate-100/50 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black w-fit group-hover:scale-105 transition-all">
                              <span className="text-[#ff7f0e]">{u.department}</span>
                              <span className="text-slate-200">|</span>
                              <span className="text-[#0f2e6e]">{u.year}-{u.section}</span>
                            </div>
                          </td>

                          <td className="p-8 text-right relative">
                            <div className="flex items-center justify-end gap-3">
                              <Button onClick={() => handleViewStudent(u)} variant="ghost" size="sm" className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#0f2e6e] hover:bg-[#0f2e6e] hover:text-white border-2 border-[#0f2e6e]/5 hover:border-[#0f2e6e] active:scale-95 transition-all">
                                View Report
                              </Button>
                              <button onClick={(e) => { e.stopPropagation(); setActiveMenuIndex(activeMenuIndex === index ? null : index); }} className="w-10 h-10 flex items-center justify-center hover:bg-[#0f2e6e]/5 text-slate-400 hover:text-[#0f2e6e] rounded-xl transition-all">
                                <MoreHorizontal className="h-5 w-5" />
                              </button>
                              {activeMenuIndex === index && (
                                <div className="absolute right-20 top-8 w-56 bg-white/90 backdrop-blur-2xl shadow-[0_20px_50px_-15px_rgba(15,46,110,0.2)] rounded-[1.5rem] border border-white z-[120] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                  {currentUserProfile?.role === 'staff' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleResetPassword(u.userId); }} className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#0f2e6e]/5 flex items-center gap-3 text-slate-600 hover:text-[#0f2e6e] transition-all border-b border-slate-50">
                                      <RefreshCw className="h-4 w-4" /> Reset Password
                                    </button>
                                  )}
                                  {currentUserProfile?.role === 'admin' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteStudent(u.userId); }} className="w-full text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 flex items-center gap-3 text-rose-600 transition-all">
                                      <Trash2 className="h-4 w-4" /> Delete Student
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div >
  );
}