"""
Seed Data — Portal Cuti
=======================
Script ini membuat data awal untuk testing:
- 1 Admin default
- 3 Karyawan contoh
- Hari libur nasional Indonesia 2025

Jalankan: python seed.py
"""
import os
import sys
from datetime import date, timedelta
from dotenv import load_dotenv

load_dotenv()

# Tambahkan path backend agar import bisa jalan
sys.path.insert(0, os.path.dirname(__file__))

from database import engine, SessionLocal
from models import Base, User, Holiday, HolidayType, UserRole, LeaveRequest, LeaveStatus
from auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def seed_users():
    print("🌱 Seeding users...")
    users = [
        User(
            email="admin@portalcuti.com",
            name="Admin Sistem",
            hashed_password=hash_password("Admin123!"),
            role=UserRole.admin,
            department="HR & Administrasi",
            position="HR Manager",
            phone="081212121212",
            leave_quota=12,
            work_start_date=date(2020, 1, 1),
            is_active=True,
        ),
        User(
            email="budi@portalcuti.com",
            name="Budi Santoso",
            hashed_password=hash_password("Karyawan123!"),
            role=UserRole.karyawan,
            department="Teknologi Informasi",
            position="Software Engineer",
            phone="081234567891",
            leave_quota=12,
            leave_used=3,
            work_start_date=date(2022, 3, 15),
            is_active=True,
        ),
        User(
            email="siti@portalcuti.com",
            name="Siti Rahayu",
            hashed_password=hash_password("Karyawan123!"),
            role=UserRole.karyawan,
            department="Keuangan",
            position="Finance Analyst",
            phone="081234567892",
            leave_quota=12,
            leave_used=5,
            work_start_date=date(2021, 6, 1),
            is_active=True,
        ),
        User(
            email="andi@portalcuti.com",
            name="Andi Prasetyo",
            hashed_password=hash_password("Karyawan123!"),
            role=UserRole.karyawan,
            department="Pemasaran",
            position="Marketing Specialist",
            phone="081234567893",
            leave_quota=12,
            leave_used=0,
            work_start_date=date(2023, 9, 1),
            is_active=True,
        ),
    ]

    for user in users:
        existing = db.query(User).filter(User.email == user.email).first()
        if not existing:
            db.add(user)
            print(f"  ✓ User: {user.name} ({user.role.value})")
        else:
            print(f"  ⏭  User sudah ada: {user.email}")

    db.commit()


def seed_holidays():
    print("🌱 Seeding hari libur nasional 2025...")
    holidays_2025 = [
        (date(2025, 1, 1),   "Tahun Baru Masehi",           HolidayType.nasional),
        (date(2025, 1, 27),  "Isra Mikraj",                  HolidayType.nasional),
        (date(2025, 1, 28),  "Cuti Bersama Imlek",           HolidayType.cuti_bersama),
        (date(2025, 1, 29),  "Tahun Baru Imlek",             HolidayType.nasional),
        (date(2025, 3, 29),  "Hari Suci Nyepi",              HolidayType.nasional),
        (date(2025, 3, 31),  "Hari Raya Idul Fitri",         HolidayType.nasional),
        (date(2025, 4, 1),   "Hari Raya Idul Fitri",         HolidayType.nasional),
        (date(2025, 4, 2),   "Cuti Bersama Idul Fitri",      HolidayType.cuti_bersama),
        (date(2025, 4, 3),   "Cuti Bersama Idul Fitri",      HolidayType.cuti_bersama),
        (date(2025, 4, 4),   "Cuti Bersama Idul Fitri",      HolidayType.cuti_bersama),
        (date(2025, 4, 18),  "Wafat Isa Al Masih",           HolidayType.nasional),
        (date(2025, 5, 1),   "Hari Buruh Internasional",     HolidayType.nasional),
        (date(2025, 5, 12),  "Hari Raya Waisak",             HolidayType.nasional),
        (date(2025, 5, 29),  "Kenaikan Isa Al Masih",        HolidayType.nasional),
        (date(2025, 6, 1),   "Hari Lahir Pancasila",         HolidayType.nasional),
        (date(2025, 6, 6),   "Hari Raya Idul Adha",          HolidayType.nasional),
        (date(2025, 6, 27),  "Tahun Baru Islam 1447 H",      HolidayType.nasional),
        (date(2025, 8, 17),  "Hari Kemerdekaan RI",          HolidayType.nasional),
        (date(2025, 9, 5),   "Maulid Nabi Muhammad SAW",     HolidayType.nasional),
        (date(2025, 12, 25), "Hari Raya Natal",              HolidayType.nasional),
        (date(2025, 12, 26), "Cuti Bersama Natal",           HolidayType.cuti_bersama),
    ]

    for holiday_date, name, htype in holidays_2025:
        existing = db.query(Holiday).filter(Holiday.date == holiday_date).first()
        if not existing:
            db.add(Holiday(date=holiday_date, name=name, type=htype))
            print(f"  ✓ {holiday_date} — {name}")
        else:
            print(f"  ⏭  Sudah ada: {holiday_date} {name}")

    db.commit()


def seed_sample_leave_requests():
    print("🌱 Seeding contoh pengajuan cuti...")
    budi = db.query(User).filter(User.email == "budi@portalcuti.com").first()
    siti = db.query(User).filter(User.email == "siti@portalcuti.com").first()
    admin = db.query(User).filter(User.email == "admin@portalcuti.com").first()

    if not budi or not siti or not admin:
        print("  ⚠️  User tidak ditemukan, skip seed leave requests.")
        return

    sample_requests = [
        LeaveRequest(
            employee_id=budi.id,
            admin_id=admin.id,
            start_date=date(2025, 2, 3),
            end_date=date(2025, 2, 5),
            duration_days=3,
            total_calendar_days=3,
            reason="Keperluan keluarga",
            notes="Pernikahan saudara",
            emergency_contact_name="Ibu Budi",
            emergency_contact_phone="08122334455",
            status=LeaveStatus.approved,
            admin_notes="Disetujui",
        ),
        LeaveRequest(
            employee_id=siti.id,
            admin_id=admin.id,
            start_date=date(2025, 3, 10),
            end_date=date(2025, 3, 14),
            duration_days=5,
            total_calendar_days=5,
            reason="Liburan tahunan",
            status=LeaveStatus.approved,
            admin_notes="Disetujui, handover sudah dilakukan",
        ),
        LeaveRequest(
            employee_id=budi.id,
            admin_id=admin.id,
            start_date=date(2025, 5, 5),
            end_date=date(2025, 5, 6),
            duration_days=2,
            total_calendar_days=2,
            reason="Urusan kesehatan",
            status=LeaveStatus.pending,
        ),
    ]

    for req in sample_requests:
        db.add(req)
    db.commit()
    print(f"  ✓ {len(sample_requests)} pengajuan cuti contoh ditambahkan.")


if __name__ == "__main__":
    print("=" * 50)
    print("   Portal Cuti — Database Seeder")
    print("=" * 50)
    seed_users()
    seed_holidays()
    seed_sample_leave_requests()
    db.close()
    print("\n✅ Seeding selesai!")
    print("\n📋 Akun default:")
    print("  Admin : admin@portalcuti.com   | Admin123!")
    print("  Karyw : budi@portalcuti.com    | Karyawan123!")
    print("  Karyw : siti@portalcuti.com    | Karyawan123!")
    print("  Karyw : andi@portalcuti.com    | Karyawan123!")
