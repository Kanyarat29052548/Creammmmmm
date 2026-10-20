import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  Key,
  Shield,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Database,
  UserCheck
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-sky-800 to-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">คู่มือการตั้งค่า Firebase Console & วิธีทดสอบระบบจริง</h3>
              <p className="text-xs text-sky-200">ขั้นตอนการเตรียมพร้อมและการทดสอบสิทธิ์ 3 ระดับ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveStep(1)}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeStep === 1
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>1. ตั้งค่า Firebase Authentication</span>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeStep === 2
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Authorized Domains (OAuth)</span>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeStep === 3
                ? 'bg-white text-blue-700 border-t-2 border-blue-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. ขั้นตอนการทดสอบระบบ 3 สิทธิ์</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex items-start gap-3">
                <Key className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sky-900">การเปิดใช้งาน Sign-in providers ใน Firebase Console</h4>
                  <p className="text-xs text-sky-800 mt-1">
                    เพื่อให้ผู้ใช้งานสามารถสมัครด้วยอีเมล/รหัสผ่าน และเข้าสู่ระบบด้วยบัญชี Google ได้จริง
                  </p>
                </div>
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                <li>
                  เข้าสู่ <strong>Firebase Console</strong> ที่{' '}
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    console.firebase.google.com <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>เลือกโปรเจกต์ของคุณ</li>
                <li>
                  ไปที่เมนู <strong>Build</strong> ด้านซ้าย แล้วคลิก <strong>Authentication</strong>
                </li>
                <li>
                  เลือกแท็บ <strong>Sign-in method</strong>
                </li>
                <li>
                  คลิกที่ <strong>Email/Password</strong> แล้วเปิดสวิตช์ <strong>Enable</strong> (ช่องแรก) จากนั้นกด <strong>Save</strong>
                </li>
                <li>
                  คลิก <strong>Add new provider</strong> เลือก <strong>Google</strong> เปิดสวิตช์ <strong>Enable</strong> กำหนด Project support email แล้วกด <strong>Save</strong>
                </li>
              </ol>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">การเพิ่ม Authorized Domain ใน Firebase Authentication</h4>
                  <p className="text-xs text-amber-800 mt-1">
                    จำเป็นสำหรับการเข้าสู่ระบบ Google Sign-in Popup บนโฮสต์ของเว็บแอปพลิเคชัน
                  </p>
                </div>
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                <li>ไปที่ <strong>Firebase Console &gt; Authentication &gt; Settings</strong></li>
                <li>เลือกแท็บ <strong>Authorized domains</strong></li>
                <li>คลิกปุ่ม <strong>Add domain</strong></li>
                <li>
                  คัดลอก Domain ของเว็บปัจจุบัน (เช่น{' '}
                  <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-xs">
                    {window.location.hostname}
                  </code>
                  ) แล้ววางลงไป จากนั้นกด <strong>Add</strong>
                </li>
              </ol>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-900">แนวทางการทดสอบระบบตามความต้องการจริง</h4>
                  <p className="text-xs text-indigo-800 mt-1">
                    ทดสอบการทำงานตั้งแต่ผู้ใช้ทั่วไป จนถึงระดับแอดมิน
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs">1) บุคคลทั่วไป (Guest)</span>
                  <p className="text-xs text-slate-600">
                    - ค้นหาสื่อความรู้ด้วยคำค้นหา<br />
                    - กรองตามหมวดหมู่ ระดับชั้น หรือประเภทสื่อ<br />
                    - คลิกเปิดดูรายละเอียดและวิดีโอ YouTube ใน Popup ได้ทันที
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs">2) สมาชิก (Member)</span>
                  <p className="text-xs text-slate-600">
                    - สมัครสมาชิกด้วยอีเมล/รหัสผ่าน หรือ Google<br />
                    - กดปุ่ม "แบ่งปันสื่อความรู้" เพื่อลงทะเบียนสื่อลง Firestore<br />
                    - กดไอคอนบุ๊กมาร์ก เพื่อบันทึกลงรายการโปรด ซิงค์ข้ามอุปกรณ์<br />
                    - กดรายงานเนื้อหาที่ไม่เหมาะสม
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="font-bold text-slate-900 block text-xs">3) ผู้ดูแลระบบ (Admin)</span>
                  <p className="text-xs text-slate-600">
                    - อีเมลเจ้าของระบบ ({'s6710380102@pkru.ac.th'}) ได้สิทธิ์ Admin อัตโนมัติ<br />
                    - เปิด "ระบบผู้ดูแล (Admin Dashboard)"<br />
                    - ตรวจสอบรายงาน ซ่อนสื่อ หรือลบสื่อจริง<br />
                    - จัดการสมาชิก ระงับบัญชี เปลี่ยนบทบาท<br />
                    - แก้ไขชื่อเว็บ คำประกาศ และเพิ่มหมวดหมู่ใหม่
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            ระบบทำงานบน Cloud Firestore & Firebase Auth จริง
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
