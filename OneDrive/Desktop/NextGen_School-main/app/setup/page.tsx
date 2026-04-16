'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function SetupPage() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [migrationMessage, setMigrationMessage] = useState('')
  const [seedMessage, setSeedMessage] = useState('')

  const runMigrations = async () => {
    setMigrationStatus('loading')
    try {
      const response = await fetch('/api/migrate')
      const data = await response.json()

      if (data.success) {
        setMigrationStatus('success')
        setMigrationMessage(`✅ ${data.message} - ${data.migrationsApplied} tables`)
      } else {
        setMigrationStatus('error')
        setMigrationMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setMigrationStatus('error')
      setMigrationMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const runSeed = async () => {
    setSeedStatus('loading')
    try {
      const response = await fetch('/api/seed')
      const data = await response.json()

      if (data.success) {
        setSeedStatus('success')
        setSeedMessage(`✅ ${data.message}\n${data.results.join('\n')}`)
      } else {
        setSeedStatus('error')
        setSeedMessage(`❌ ${data.error}`)
      }
    } catch (error) {
      setSeedStatus('error')
      setSeedMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-violet-50 to-cyan-50 p-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">NextGen School Setup</CardTitle>
            <CardDescription>Initialize your database and demo data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Migrations Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">1. Create Database Tables</h3>
                <p className="text-sm text-gray-600 mt-1">Initialize all required tables for the application</p>
              </div>

              {migrationStatus !== 'idle' && (
                <Alert className={migrationStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-start gap-2">
                    {migrationStatus === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <AlertDescription className={migrationStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                      {migrationMessage}
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                onClick={runMigrations}
                disabled={migrationStatus === 'loading'}
                className="w-full"
              >
                {migrationStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {migrationStatus === 'loading' ? 'Creating Tables...' : 'Create Tables'}
              </Button>
            </div>

            <div className="border-t pt-6" />

            {/* Seed Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">2. Seed Demo Users</h3>
                <p className="text-sm text-gray-600 mt-1">Create demo accounts for testing</p>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>📧 <span className="font-mono">admin@nextgenschool.com</span> - Admin</p>
                  <p>📧 <span className="font-mono">teacher@nextgenschool.com</span> - Teacher</p>
                  <p>📧 <span className="font-mono">student@nextgenschool.com</span> - Student</p>
                  <p>🔑 Password for all: <span className="font-mono">demo123</span></p>
                </div>
              </div>

              {seedStatus !== 'idle' && (
                <Alert className={seedStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <div className="flex items-start gap-2">
                    {seedStatus === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <AlertDescription className={seedStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                      <pre className="text-xs whitespace-pre-wrap">{seedMessage}</pre>
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              <Button
                onClick={runSeed}
                disabled={seedStatus === 'loading' || migrationStatus !== 'success'}
                className="w-full"
              >
                {seedStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {seedStatus === 'loading' ? 'Seeding Users...' : 'Create Demo Users'}
              </Button>

              <p className="text-xs text-gray-600 text-center">
                ℹ️ If you already have users, this will skip duplicates. Use "Reset & Reseed" to force update.
              </p>
            </div>

            <div className="border-t pt-6" />

            {/* Reset Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">3. Reset & Reseed Demo Users</h3>
                <p className="text-sm text-gray-600 mt-1">Delete and recreate demo users with correct passwords</p>
              </div>

              <Button
                onClick={async () => {
                  setSeedStatus('loading')
                  try {
                    const response = await fetch('/api/reset-seed')
                    const data = await response.json()
                    if (data.success) {
                      setSeedStatus('success')
                      setSeedMessage(`✅ ${data.message}\n${data.results.join('\n')}`)
                    } else {
                      setSeedStatus('error')
                      setSeedMessage(`❌ ${data.error}`)
                    }
                  } catch (error) {
                    setSeedStatus('error')
                    setSeedMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
                  }
                }}
                disabled={seedStatus === 'loading'}
                variant="outline"
                className="w-full"
              >
                {seedStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset & Reseed Demo Users
              </Button>
            </div>

            <div className="border-t pt-6" />

            {/* Demo Institutions Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">4. Seed Demo Institutions</h3>
                <p className="text-sm text-gray-600 mt-1">Create institutional demo accounts</p>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>🏛️ <span className="font-mono">harvard@institution.com</span> - Harvard Academy</p>
                  <p>🎓 <span className="font-mono">stanford@institution.com</span> - Stanford School</p>
                  <p>📚 <span className="font-mono">oxford@institution.com</span> - Oxford Institute</p>
                  <p>🔑 Password for all: <span className="font-mono">demo123</span></p>
                </div>
              </div>

              <Button
                onClick={async () => {
                  setSeedStatus('loading')
                  try {
                    const response = await fetch('/api/seed-demo-institutions')
                    const data = await response.json()
                    if (data.success) {
                      setSeedStatus('success')
                      setSeedMessage(`✅ ${data.message}\n${data.results.join('\n')}`)
                    } else {
                      setSeedStatus('error')
                      setSeedMessage(`❌ ${data.error}`)
                    }
                  } catch (error) {
                    setSeedStatus('error')
                    setSeedMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
                  }
                }}
                disabled={seedStatus === 'loading'}
                variant="outline"
                className="w-full"
              >
                {seedStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Demo Institutions
              </Button>
            </div>

            <div className="border-t pt-6" />

            {/* Demo Courses Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-700">5. Seed Demo Courses & Content</h3>
                <p className="text-sm text-gray-600 mt-1">Create 5 sample courses with modules for students to explore</p>
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>📐 Introduction to Mathematics</p>
                  <p>📖 English Language Arts</p>
                  <p>🔬 Science Fundamentals</p>
                  <p>🌍 Social Studies & History</p>
                  <p>💻 Introduction to Computer Science</p>
                </div>
              </div>

              <Button
                onClick={async () => {
                  setSeedStatus('loading')
                  try {
                    const response = await fetch('/api/seed-demo-courses')
                    const data = await response.json()
                    if (data.success) {
                      setSeedStatus('success')
                      setSeedMessage(`✅ ${data.message}\n${data.results.join('\n')}\n\n${data.nextSteps?.join('\n') || ''}`)
                    } else {
                      setSeedStatus('error')
                      setSeedMessage(`❌ ${data.error}`)
                    }
                  } catch (error) {
                    setSeedStatus('error')
                    setSeedMessage(`❌ ${error instanceof Error ? error.message : 'Unknown error'}`)
                  }
                }}
                disabled={seedStatus === 'loading'}
                variant="outline"
                className="w-full"
              >
                {seedStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Sample Courses
              </Button>
            </div>

            <div className="border-t pt-6" />

            {/* Next Steps */}
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800 space-y-2">
                <p className="font-semibold">✅ Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Click "Create Tables" to set up the database</li>
                  <li>Click "Reset & Reseed Demo Users" to create user accounts</li>
                  <li>Click "Create Demo Institutions" for institutional login</li>
                  <li>Click "Create Sample Courses" to populate with content</li>
                  <li>Go to <a href="/login" className="font-semibold underline">login</a> and try different accounts</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
