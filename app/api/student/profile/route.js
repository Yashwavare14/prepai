import { auth, currentUser } from "@clerk/nextjs/server";
import { getStudentById, upsertStudent } from "@/lib/db/queries";
import { studentProfileSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await getStudentById(userId);
    if (student) {
      return Response.json({ exists: true, student });
    }

    // Prefill from Clerk user profile if not yet in database
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || "";
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "";
    const avatarUrl = user?.imageUrl || null;

    return Response.json({
      exists: false,
      student: {
        id: userId,
        email,
        name,
        avatarUrl,
        targetExams: [],
        targetYear: new Date().getFullYear().toString(),
        preferredLanguage: "en",
        dailyGoalQuestions: 20,
        onboardingCompleted: false,
      },
    });
  } catch (err) {
    console.error("GET /api/student/profile error:", err);
    return Response.json({ error: "Failed to fetch student profile" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = studentProfileSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get avatar / email fallback from Clerk if not passed
    let avatarUrl = body.avatarUrl;
    let email = result.data.email;
    if (!email || !avatarUrl) {
      const user = await currentUser();
      if (!email) email = user?.primaryEmailAddress?.emailAddress || "";
      if (!avatarUrl) avatarUrl = user?.imageUrl || null;
    }

    const studentData = {
      id: userId,
      ...result.data,
      email,
      avatarUrl,
      onboardingCompleted: true,
      role: "student",
    };

    const savedStudent = await upsertStudent(studentData);
    return Response.json({ success: true, student: savedStudent });
  } catch (err) {
    console.error("POST /api/student/profile error:", err);
    return Response.json({ error: err.message || "Failed to save profile" }, { status: 500 });
  }
}
