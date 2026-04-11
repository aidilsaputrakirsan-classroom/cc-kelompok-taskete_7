"""
SIMCUTI — Database Seeder
Membuat data awal: 1 akun Admin, 3 akun Karyawan demo, dan hari libur nasional 2026.

Jalankan setelah database siap:
  python seed.py

Atau otomatis dijalankan melalui docker-compose entrypoint.
"""
import os
import sys
from datetime import date
from dotenv import load_dotenv

load_dotenv()

from database import SessionLocal, engine
from models import Base, User, Holiday
from auth import hash_password

# Buat semua tabel jika belum ada
Base.metadata.create_all(bind=engine)

db = SessionLocal()


def seed_admin():
    """Buat akun Admin default jika belum ada."""
    existing = db.query(User).filter(User.email == "admin@simcuti.id").first()
    if existing:
        print("  [SKIP] Admin sudah ada.")
        return

    admin = User(
        email="admin@simcuti.id",
        name="Admin SIMCUTI",
        hashed_password=hash_password("Admin@2026"),
        role="admin",
        department="Human Resources",
        join_date=date(2020, 1, 1),
        annual_leave_quota=12,
    )
    db.add(admin)
    db.commit()
    print("  [OK] Admin dibuat: admin@simcuti.id / Admin@2026")


def seed_karyawan():
    """Buat 3 akun Karyawan demo."""
    karyawans = [
        {
            "email": "noviansyah@simcuti.id",
            "name": "Noviansyah",
            "password": "Karya@2026",
            "department": "Engineering",
            "join_date": date(2022, 3, 15),
        },
        {
            "email": "irwan@simcuti.id",
            "name": "Irwan Maulana",
            "password": "Karya@2026",
            "department": "Product",
            "join_date": date(2023, 1, 10),
        },
        {
            "email": "amalia@simcuti.id",
            "name": "Amalia Tiara Rezfani",
            "password": "Karya@2026",
            "department": "Quality Assurance",
            "join_date": date(2021, 7, 20),
        },
    ]
    for k in karyawans:
        existing = db.query(User).filter(User.email == k["email"]).first()
        if existing:
            print(f"  [SKIP] Karyawan {k['name']} sudah ada.")
            continue
        user = User(
            email=k["email"],
            name=k["name"],
            hashed_password=hash_password(k["password"]),
            role="karyawan",
            department=k["department"],
            join_date=k["join_date"],
            annual_leave_quota=12,
        )
        db.add(user)
    db.commit()
    print("  [OK] 3 Karyawan demo dibuat (password: Karya@2026)")


def seed_holidays():
    """Seed hari libur nasional Indonesia 2026."""
    holidays_2026 = [
        (date(2026, 1, 1), "Tahun Baru 2026", "nasional"),
        (date(2026, 1, 27), "Isra Mikraj Nabi Muhammad SAW", "nasional"),
        (date(2026, 1, 29), "Tahun Baru Imlek 2577", "nasional"),
        (date(2026, 3, 14), "Hari Raya Nyepi", "nasional"),
        (date(2026, 3, 20), "Hari Kematian Yesus Kristus/Good Friday", "nasional"),
        (date(2026, 3, 29), "Hari Raya Idul Fitri 1447 H (Hari 1)", "nasional"),
        (date(2026, 3, 30), "Hari Raya Idul Fitri 1447 H (Hari 2)", "nasional"),
        (date(2026, 3, 26), "Cuti Bersama Idul Fitri", "cuti_bersama"),
        (date(2026, 3, 27), "Cuti Bersama Idul Fitri", "cuti_bersama"),
        (date(2026, 4, 1), "Cuti Bersama Idul Fitri", "cuti_bersama"),
        (date(2026, 4, 2), "Cuti Bersama Idul Fitri", "cuti_bersama"),
        (date(2026, 5, 1), "Hari Buruh Internasional", "nasional"),
        (date(2026, 5, 14), "Kenaikan Isa Almasih", "nasional"),
        (date(2026, 5, 22), "Hari Raya Waisak", "nasional"),
        (date(2026, 6, 6), "Hari Raya Idul Adha 1447 H", "nasional"),
        (date(2026, 6, 26), "Tahun Baru Islam 1448 H", "nasional"),
        (date(2026, 8, 17), "Hari Kemerdekaan Republik Indonesia", "nasional"),
        (date(2026, 9, 4), "Maulid Nabi Muhammad SAW", "nasional"),
        (date(2026, 12, 25), "Hari Raya Natal", "nasional"),
        (date(2026, 12, 26), "Cuti Bersama Natal", "cuti_bersama"),
    ]

    added = 0
    for h_date, h_name, h_type in holidays_2026:
        existing = db.query(Holiday).filter(Holiday.date == h_date).first()
        if not existing:
            db.add(Holiday(date=h_date, name=h_name, type=h_type))
            added += 1

    db.commit()
    print(f"  [OK] {added} hari libur nasional 2026 di-seed.")


def main():
    print("\n🌱 SIMCUTI — Database Seeder")
    print("=" * 40)
    print("📌 Membuat data awal...")

    try:
        seed_admin()
        seed_karyawan()
        seed_holidays()

        print("\n✅ Seeding selesai!")
        print("\n📋 Akun yang tersedia:")
        print("  👤 Admin   : admin@simcuti.id   / Admin@2026")
        print("  👤 Karyawan: noviansyah@simcuti.id / Karya@2026")
        print("  👤 Karyawan: irwan@simcuti.id       / Karya@2026")
        print("  👤 Karyawan: amalia@simcuti.id      / Karya@2026")
        print("\n🚀 Buka: http://localhost:3000")
        print("📚 Swagger: http://localhost:8000/docs\n")
    except Exception as e:
        print(f"\n❌ Error saat seeding: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
