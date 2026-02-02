# Seed data & dummy credentials

After running the seed, you can sign in with these accounts.

## How to seed

From the project root:

```bash
npm run seed
```

Or with Prisma:

```bash
npx prisma db seed
```

## Dummy credentials

Use these to sign in at your frontend (e.g. `/api/auth/sign-in/email`).

| Role     | Email                    | Password   |
|----------|--------------------------|------------|
| **Admin**   | `admin@skillbridge.demo`   | `Admin123!` |
| **Student** | `student@skillbridge.demo` | `Student123!` |

**Tutors** (all use password `Tutor123!`):

| Email                    | Name         | Subjects              | Price/hr |
|--------------------------|--------------|------------------------|----------|
| `tutor@skillbridge.demo` | Alex Chen    | Algebra, Calculus, Physics | 45       |
| `tutor2@skillbridge.demo` | Jordan Lee   | Algebra, Calculus     | 50       |
| `tutor3@skillbridge.demo` | Sam Rivera   | Physics, Chemistry    | 55       |
| `tutor4@skillbridge.demo` | Morgan Taylor | Algebra, Calculus   | 40       |
| `tutor5@skillbridge.demo` | Casey Kim   | Physics, Chemistry    | 48       |

- **Admin** – can create categories and subjects.
- **Tutors** – 5 tutors with different subjects and prices.
- **Student** – default role; can book tutors and leave reviews.

## What the seed creates

- **Categories:** Mathematics, Science  
- **Subjects:** Algebra, Calculus (Math), Physics, Chemistry (Science)  
- **Users:** 1 admin, 1 student, 5 tutors (emails/passwords above)  
- **Tutor profiles:** one per tutor with bio, price, and subjects

You can run `npm run seed` again; it will skip or update existing data (upserts).
