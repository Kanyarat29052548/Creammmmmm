import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Flag,
  Users,
  Settings as SettingsIcon,
  EyeOff,
  Eye,
  Trash2,
  CheckCircle,
  Ban,
  Check,
  Plus,
  Search,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { ReportItem, Resource, UserProfile, ModerationLog } from '../types';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (errorMsg: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const { currentUser, isAdmin, isModerator } = useAuth();
  const { settings, updateSettings, addCategory, removeCategory } = useSite();

  const [activeTab, setActiveTab] = useState<'reports' | 'members' | 'settings' | 'logs'>('reports');

  // Reports state
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Users state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Resources map for quick lookup
  const [resourcesMap, setResourcesMap] = useState<Record<string, Resource>>({});

  // Moderation Logs
  const [logs, setLogs] = useState<ModerationLog[]>([]);

  // Site settings form state
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(settings.isAnnouncementActive);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    type: 'resource' | 'report';
    title: string;
  } | null>(null);

  // Sync settings when loaded
  useEffect(() => {
    setSiteName(settings.siteName);
    setSiteDescription(settings.siteDescription);
    setAnnouncement(settings.announcement);
    setIsAnnouncementActive(settings.isAnnouncementActive);
  }, [settings]);

  // Load Reports Realtime
  useEffect(() => {
    if (!isOpen || !isModerator) return;
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReportItem));
        setReports(items);
        setReportsLoading(false);
      },
      (error) => {
        console.error('Error loading reports:', error);
        setReportsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen, isModerator]);

  // Load Users Realtime (Admins only)
  useEffect(() => {
    if (!isOpen || !isAdmin) return;
    const q = query(collection(db, 'users'), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
        setUsersList(items);
        setUsersLoading(false);
      },
      (error) => {
        console.error('Error loading users:', error);
        setUsersLoading(false);
      }
    );
    return () => unsubscribe();
  }, [isOpen, isAdmin]);

  // Load All Resources for reference
  useEffect(() => {
    if (!isOpen || !isModerator) return;
    const unsubscribe = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const map: Record<string, Resource> = {};
      snapshot.docs.forEach((docSnap) => {
        map[docSnap.id] = { id: docSnap.id, ...docSnap.data() } as Resource;
      });
      setResourcesMap(map);
    });
    return () => unsubscribe();
  }, [isOpen, isModerator]);

  // Load Moderation Logs
  useEffect(() => {
    if (!isOpen || !isModerator) return;
    const q = query(collection(db, 'moderationLogs'), orderBy('createdAt', 'desc'), limit(30));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ModerationLog));
        setLogs(items);
      },
      (err) => console.warn('Logs subscription info:', err)
    );
    return () => unsubscribe();
  }, [isOpen, isModerator]);

  if (!isOpen) return null;

  // Add a Moderation Log entry
  const recordLog = async (action: string, targetId: string, targetType: 'resource' | 'user' | 'setting', details: string) => {
    try {
      await addDoc(collection(db, 'moderationLogs'), {
        action,
        targetId,
        targetType,
        moderatorId: currentUser?.uid || 'admin',
        moderatorEmail: currentUser?.email || 'admin',
        details,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Could not record moderation log:', err);
    }
  };

  // Toggle Hide Resource
  const handleToggleHideResource = async (resourceId: string, currentHidden: boolean) => {
    try {
      const docRef = doc(db, 'resources', resourceId);
      await updateDoc(docRef, {
        isHiddenByAdmin: !currentHidden,
        updatedAt: new Date().toISOString()
      });
      await recordLog(
        !currentHidden ? 'HIDE_RESOURCE' : 'UNHIDE_RESOURCE',
        resourceId,
        'resource',
        `สถานะ: ${!currentHidden ? 'ซ่อนจากสาธารณะ' : 'ยกเลิกการซ่อน'}`
      );
      onSuccess(!currentHidden ? 'ซ่อนสื่อจากสาธารณะเรียบร้อยแล้ว' : 'แสดงสื่อสู่สาธารณะอีกครั้ง');
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการเปลี่ยนสถานะสื่อ');
    }
  };

  // Delete Resource Confirmed
  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteDoc(doc(db, 'resources', resourceId));
      await recordLog('DELETE_RESOURCE', resourceId, 'resource', 'ลบสื่อการเรียนรู้ออกจากระบบถาวร');
      onSuccess('ลบสื่อการเรียนรู้ออกจากฐานข้อมูลเรียบร้อยแล้ว');
      setDeleteConfirmTarget(null);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการลบสื่อ');
    }
  };

  // Resolve Report
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      const docRef = doc(db, 'reports', reportId);
      await updateDoc(docRef, { status });
      await recordLog(
        status === 'resolved' ? 'RESOLVE_REPORT' : 'DISMISS_REPORT',
        reportId,
        'resource',
        `ปรับสถานะรายงานเป็น: ${status}`
      );
      onSuccess(`ปรับสถานะรายงานเป็น "${status === 'resolved' ? 'ดำเนินการแล้ว' : 'ยกเลิกคำขอ'}" สำเร็จ`);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการอัปเดตรายงาน');
    }
  };

  // Change User Role
  const handleChangeUserRole = async (targetUser: UserProfile, newRole: 'member' | 'moderator' | 'admin') => {
    if (!isAdmin) {
      onError('เฉพาะผู้ดูแลระบบระดับสูง (Admin) เท่านั้นที่สามารถเปลี่ยนบทบาทได้');
      return;
    }
    try {
      const docRef = doc(db, 'users', targetUser.uid);
      await updateDoc(docRef, {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      await recordLog(
        'CHANGE_USER_ROLE',
        targetUser.uid,
        'user',
        `เปลี่ยนบทบาทของ ${targetUser.email} เป็น ${newRole}`
      );
      onSuccess(`เปลี่ยนบทบาทของ ${targetUser.displayName} เป็น ${newRole} เรียบร้อยแล้ว`);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการปรับเปลี่ยนบทบาทผู้ใช้');
    }
  };

  // Toggle Suspend User
  const handleToggleSuspendUser = async (targetUser: UserProfile) => {
    if (!isAdmin) {
      onError('เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถระงับบัญชีได้');
      return;
    }
    const newStatus = !targetUser.isSuspended;
    try {
      const docRef = doc(db, 'users', targetUser.uid);
      await updateDoc(docRef, {
        isSuspended: newStatus,
        updatedAt: new Date().toISOString()
      });
      await recordLog(
        newStatus ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
        targetUser.uid,
        'user',
        `สถานะระงับ: ${newStatus ? 'ระงับบัญชี' : 'ปลดระงับบัญชี'}`
      );
      onSuccess(newStatus ? `ระงับบัญชี ${targetUser.displayName} เรียบร้อยแล้ว` : `ปลดระงับบัญชีสำเร็จ`);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการแก้ไขสถานะผู้ใช้');
    }
  };

  // Save Website General Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      await updateSettings(
        {
          siteName: siteName.trim(),
          siteDescription: siteDescription.trim(),
          announcement: announcement.trim(),
          isAnnouncementActive
        },
        currentUser?.email || 'admin'
      );
      await recordLog('UPDATE_SETTINGS', 'general', 'setting', 'อัปเดตข้อมูลและคำประกาศหน้าเว็บไซต์');
      onSuccess('บันทึกการตั้งค่าเว็บไซต์และคำประกาศเรียบร้อยแล้ว!');
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSettingsSaving(false);
    }
  };

  // Add Category Handler
  const handleAddCategorySubmit = async () => {
    if (!newCategoryInput.trim()) return;
    try {
      await addCategory(newCategoryInput.trim(), currentUser?.email || 'admin');
      await recordLog('ADD_CATEGORY', newCategoryInput.trim(), 'setting', `เพิ่มหมวดหมู่: ${newCategoryInput.trim()}`);
      setNewCategoryInput('');
      onSuccess(`เพิ่มหมวดหมู่ "${newCategoryInput.trim()}" เรียบร้อยแล้ว`);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่');
    }
  };

  // Remove Category Handler
  const handleRemoveCategorySubmit = async (catName: string) => {
    try {
      await removeCategory(catName, currentUser?.email || 'admin');
      await recordLog('REMOVE_CATEGORY', catName, 'setting', `ลบหมวดหมู่: ${catName}`);
      onSuccess(`ลบหมวดหมู่ "${catName}" เรียบร้อยแล้ว`);
    } catch (err) {
      onError('เกิดข้อผิดพลาดในการลบหมวดหมู่');
    }
  };

  // Filtered users for search
  const filteredUsers = usersList.filter(
    (u) =>
      u.displayName?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ระบบผู้ดูแล (Admin & Moderator Dashboard)</h2>
              <p className="text-xs text-sky-200">
                จัดการเนื้อหาที่ถูกรายงาน สมาชิก และการตั้งค่าเว็บไซต์แบบ Real-time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Flag className="w-4 h-4" />
            <span>รายงานเนื้อหา ({reports.filter((r) => r.status === 'pending').length} รอดำเนินการ)</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'members'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>จัดการสมาชิก ({usersList.length})</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>ตั้งค่าเว็บไซต์ & หมวดหมู่</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>ประวัติการตรวจสอบ ({logs.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">รายการที่ถูกรายงานจากผู้ใช้</h3>
                  <p className="text-xs text-slate-500">
                    ตรวจสอบสื่อที่ได้รับรายงาน เช่น ลิงก์เสีย ลิขสิทธิ์ หรือเนื้อหาไม่เหมาะสม
                  </p>
                </div>
              </div>

              {reportsLoading ? (
                <div className="p-12 text-center text-slate-400">กำลังโหลดรายการรายงาน...</div>
              ) : reports.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">ไม่มีรายการรายงานเนื้อหาในขณะนี้</p>
                  <p className="text-xs text-slate-400 mt-0.5">สื่อการเรียนรู้ทั้งหมดมีความปลอดภัย</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => {
                    const linkedResource = resourcesMap[report.resourceId];
                    const isHidden = linkedResource?.isHiddenByAdmin;

                    return (
                      <div
                        key={report.id}
                        className={`bg-white p-5 rounded-2xl border transition-all ${
                          report.status === 'pending'
                            ? 'border-amber-200 shadow-xs'
                            : 'border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                  report.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : report.status === 'resolved'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {report.status === 'pending'
                                  ? '⏳ รอดำเนินการ'
                                  : report.status === 'resolved'
                                  ? '✅ ดำเนินการแล้ว'
                                  : '⚪ ยกเลิกคำขอ'}
                              </span>

                              <span className="text-xs text-slate-400 font-medium">
                                ผู้รายงาน: {report.reporterEmail}
                              </span>
                            </div>

                            <h4 className="font-bold text-base text-slate-900 mt-1">
                              {report.resourceTitle}
                            </h4>

                            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                              <p>
                                <strong>สาเหตุ:</strong> {report.reason}
                              </p>
                              {report.details && (
                                <p className="mt-1">
                                  <strong>รายละเอียด:</strong> {report.details}
                                </p>
                              )}
                            </div>

                            {linkedResource && (
                              <div className="text-xs text-slate-500 pt-1 flex items-center gap-2">
                                <span>สถานะสื่อ: </span>
                                {isHidden ? (
                                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                                    <EyeOff className="w-3.5 h-3.5" /> ซ่อนอยู่
                                  </span>
                                ) : (
                                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> แสดงสู่สาธารณะ
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                            {linkedResource && (
                              <button
                                onClick={() => handleToggleHideResource(report.resourceId, !!isHidden)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                                  isHidden
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{isHidden ? 'ยกเลิกการซ่อน' : 'ซ่อนสื่อนี้'}</span>
                              </button>
                            )}

                            {isAdmin && (
                              <button
                                onClick={() =>
                                  setDeleteConfirmTarget({
                                    id: report.resourceId,
                                    type: 'resource',
                                    title: report.resourceTitle
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>ลบสื่อถาวร</span>
                              </button>
                            )}

                            {report.status === 'pending' && (
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={() => handleResolveReport(report.id, 'resolved')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                  title="ทำเครื่องหมายว่าจัดการแล้ว"
                                >
                                  จัดการแล้ว
                                </button>
                                <button
                                  onClick={() => handleResolveReport(report.id, 'dismissed')}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg"
                                  title="เพิกเฉยรายงานนี้"
                                >
                                  ละเว้น
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && isAdmin && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">จัดการสมาชิกและสิทธิ์การใช้งาน</h3>
                  <p className="text-xs text-slate-500">
                    ค้นหา ปรับบทบาท (Member, Moderator, Admin) หรือระงับบัญชีผู้ใช้
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="ค้นหาชื่อหรืออีเมล..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {usersLoading ? (
                <div className="p-12 text-center text-slate-400">กำลังโหลดรายชื่อสมาชิก...</div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">สมาชิก</th>
                        <th className="px-4 py-3">อีเมล</th>
                        <th className="px-4 py-3">บทบาท (Role)</th>
                        <th className="px-4 py-3">สถานะบัญชี</th>
                        <th className="px-4 py-3 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((user) => {
                        const isSelf = user.uid === currentUser?.uid;

                        return (
                          <tr key={user.uid} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3.5 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="font-semibold">{user.displayName || 'ไม่มีชื่อ'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 text-xs font-mono">{user.email}</td>
                            <td className="px-4 py-3.5">
                              <select
                                value={user.role}
                                disabled={isSelf}
                                onChange={(e) =>
                                  handleChangeUserRole(user, e.target.value as 'member' | 'moderator' | 'admin')
                                }
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none ${
                                  user.role === 'admin'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : user.role === 'moderator'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-50 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="member">สมาชิกทั่วไป (Member)</option>
                                <option value="moderator">ผู้ตรวจสอบ (Moderator)</option>
                                <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                              </select>
                            </td>
                            <td className="px-4 py-3.5">
                              {user.isSuspended ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                                  <Ban className="w-3 h-3" /> ถูกระงับบัญชี
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check className="w-3 h-3" /> ใช้งานปกติ
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleSuspendUser(user)}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                    user.isSuspended
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  }`}
                                >
                                  {user.isSuspended ? 'ปลดระงับ' : 'ระงับบัญชี'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SETTINGS & DYNAMIC CATEGORIES */}
          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-6">
              {/* Site Information Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  ตั้งค่าทั่วไปและประกาศหน้าเว็บ
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  แก้ไขข้อมูลที่แสดงบนหน้าแรกโดยไม่ต้องแก้ไขซอร์สโค้ด
                </p>

                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        ชื่อเว็บไซต์ (Site Name)
                      </label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        คำโปรย / รายละเอียดย่อ
                      </label>
                      <input
                        type="text"
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        ข้อความประกาศสำคัญด้านบน (Announcement Banner)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={isAnnouncementActive}
                          onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>เปิดใช้งานแถบประกาศ</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={announcement}
                      onChange={(e) => setAnnouncement(e.target.value)}
                      placeholder="เช่น ขยายเวลารับสมัครครูต้นแบบเพื่อการเรียนรู้..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={settingsSaving}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all disabled:opacity-50"
                    >
                      {settingsSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าเว็บไซต์'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Dynamic Categories Management */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      จัดการหมวดหมู่ความรู้ (Categories)
                    </h3>
                    <p className="text-xs text-slate-500">
                      เพิ่มหรือลบหมวดหมู่ความรู้ในระบบ ข้อมูลจะอัปเดตบนหน้าเว็บแบบสด
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      placeholder="พิมพ์ชื่อหมวดหมู่ใหม่..."
                      className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCategorySubmit();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddCategorySubmit}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>เพิ่มหมวดหมู่</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {settings.categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
                    >
                      <span>{cat}</span>
                      <button
                        onClick={() => handleRemoveCategorySubmit(cat)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                        title={`ลบหมวดหมู่ ${cat}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">บันทึกประวัติการตรวจสอบ (Audit Logs)</h3>
                <p className="text-xs text-slate-500">
                  ประวัติการดำเนินการของผู้ดูแลและผู้ตรวจสอบ เพื่อความโปร่งใสและตรวจสอบได้
                </p>
              </div>

              {logs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  ยังไม่มีประวัติการดำเนินการบันทึกไว้
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {log.action}
                          </span>
                          <span className="text-slate-500">โดย {log.moderatorEmail}</span>
                        </div>
                        <p className="text-slate-700 font-medium">{log.details}</p>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0">
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-rose-100 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h4 className="font-bold text-slate-900 text-base">ยืนยันการลบถาวร?</h4>
                <p className="text-xs text-slate-600 mt-1">
                  คุณกำลังจะลบ <strong>"{deleteConfirmTarget.title}"</strong> ออกจากฐานข้อมูลจริง
                  การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleDeleteResource(deleteConfirmTarget.id)}
                  className="py-2.5 bg-rose-600 text-white font-semibold rounded-xl text-xs shadow-md"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
