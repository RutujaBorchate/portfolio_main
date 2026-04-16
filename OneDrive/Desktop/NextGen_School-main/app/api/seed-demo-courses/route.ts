import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const results = []

    // Get teacher user
    const teachers = await sql`
      SELECT id FROM users WHERE email = 'teacher@nextgenschool.com'
    `

    if (teachers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Teacher account not found. Please reseed users first.',
      }, { status: 400 })
    }

    const teacherId = teachers[0].id

    // Clear existing demo courses
    try {
      await sql`DELETE FROM courses WHERE teacher_id = ${teacherId}`
      results.push('✅ Cleared existing demo courses')
    } catch (e) {
      results.push(`⚠️ Note: ${e instanceof Error ? e.message : 'Error clearing courses'}`)
    }

    // Sample courses data
    const courses = [
      {
        title: 'Introduction to Mathematics',
        description: 'Learn fundamental math concepts for grades 4-6. Covers arithmetic, fractions, decimals, and basic geometry.',
        thumbnail: '📐',
        modules: [
          { title: 'Numbers and Operations', duration: 15 },
          { title: 'Fractions Explained', duration: 20 },
          { title: 'Decimals and Percentages', duration: 18 },
          { title: 'Basic Geometry', duration: 25 },
        ]
      },
      {
        title: 'English Language Arts',
        description: 'Develop reading, writing, and communication skills. Perfect for grades 5-8.',
        thumbnail: '📖',
        modules: [
          { title: 'Reading Comprehension', duration: 20 },
          { title: 'Writing Skills', duration: 25 },
          { title: 'Grammar Basics', duration: 18 },
          { title: 'Literature Analysis', duration: 22 },
          { title: 'Public Speaking', duration: 20 },
        ]
      },
      {
        title: 'Science Fundamentals',
        description: 'Explore biology, chemistry, and physics concepts through interactive lessons.',
        thumbnail: '🔬',
        modules: [
          { title: 'The Living World - Biology', duration: 25 },
          { title: 'Matter and Energy', duration: 20 },
          { title: 'Chemical Reactions', duration: 22 },
          { title: 'Forces and Motion', duration: 18 },
          { title: 'The Earth and Space', duration: 30 },
        ]
      },
      {
        title: 'Social Studies & History',
        description: 'Learn about world history, geography, cultures, and civilizations.',
        thumbnail: '🌍',
        modules: [
          { title: 'Ancient Civilizations', duration: 30 },
          { title: 'World Geography', duration: 25 },
          { title: 'Modern History', duration: 28 },
          { title: 'Cultures Around the World', duration: 20 },
        ]
      },
      {
        title: 'Introduction to Computer Science',
        description: 'Learn coding basics, computational thinking, and digital literacy.',
        thumbnail: '💻',
        modules: [
          { title: 'Computer Basics', duration: 15 },
          { title: 'Introduction to Programming', duration: 25 },
          { title: 'Algorithms and Logic', duration: 20 },
          { title: 'Digital Citizenship', duration: 15 },
        ]
      },
    ]

    // Create courses with modules
    let courseCount = 0
    let moduleCount = 0

    for (const courseData of courses) {
      try {
        // Insert course
        const courseResult = await sql`
          INSERT INTO courses (title, description, thumbnail, teacher_id, status)
          VALUES (${courseData.title}, ${courseData.description}, ${courseData.thumbnail}, ${teacherId}, 'approved')
          RETURNING id
        `

        if (courseResult.length > 0) {
          const courseId = courseResult[0].id
          courseCount++

          // Insert modules for this course
          for (let i = 0; i < courseData.modules.length; i++) {
            const module = courseData.modules[i]
            try {
              await sql`
                INSERT INTO modules (course_id, title, description, order_number, duration_minutes)
                VALUES (${courseId}, ${module.title}, ${module.title} + ' content', ${i + 1}, ${module.duration})
              `
              moduleCount++
            } catch (moduleError) {
              console.error(`Error creating module: ${moduleError}`)
            }
          }

          results.push(`✅ Created course: ${courseData.title} with ${courseData.modules.length} modules`)
        }
      } catch (courseError) {
        results.push(`❌ Error creating course ${courseData.title}: ${courseError instanceof Error ? courseError.message : 'Unknown'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Demo database populated successfully',
      stats: {
        coursesCreated: courseCount,
        modulesCreated: moduleCount,
        totalCoursesSamples: courses.length,
      },
      results,
      nextSteps: [
        '1. Go to /setup and ensure you are still logged in',
        '2. Visit /login and login as student@nextgenschool.com / demo123',
        '3. Go to /student/courses to see all available courses',
        '4. Click "Enroll Now" to enroll in any course',
        '5. Click a course to view modules and start learning',
      ]
    })
  } catch (error) {
    console.error('Demo data error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create demo data',
      },
      { status: 500 }
    )
  }
}
