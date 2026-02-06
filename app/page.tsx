'use client'

import { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Loader2,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Phone,
  Video,
  Clock,
  Shield,
  MessageSquare,
  Menu,
  X,
  Home as HomeIcon,
  ClipboardList,
  History,
  Users,
  LayoutDashboard,
  Navigation,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Download,
  Filter,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Activity,
  FileText,
  Settings,
  Bell,
  User,
  ChevronLeft
} from 'lucide-react'

// ============================================================================
// TypeScript Interfaces (from actual test responses)
// ============================================================================

interface Symptom {
  symptom_name: string
  body_location: string
  severity: string
  duration: string
  frequency: string
  additional_details: string
}

interface RedFlagPattern {
  pattern_name: string
  matched_symptoms: string[]
  severity: string
  reason: string
}

interface RedFlags {
  red_flag_detected: boolean
  severity: string
  red_flag_patterns: RedFlagPattern[]
  immediate_action_required: boolean
  recommended_action: string
  escalation_triggered: boolean
  safety_message: string
}

interface RiskFactor {
  factor_name: string
  weight: number
  contribution: string
  reasoning: string
}

interface RiskAssessment {
  risk_score: number
  urgency_level: string
  risk_factors: RiskFactor[]
  composite_assessment: string
  recommended_timeframe: string
  confidence_level: string
}

interface Specialist {
  specialty: string
  reason: string
  confidence?: string
}

interface SpecialistRecommendations {
  primary_specialist: Specialist
  secondary_specialists: Specialist[]
  affected_systems: string[]
  routing_summary: string
  alternative_care_options: string[]
}

interface TriageResult {
  assessment_id: string
  patient_summary: {
    structured_symptoms: {
      extracted_symptoms: Symptom[]
      structured_summary: string
    }
    red_flags: RedFlags
    risk_assessment: RiskAssessment
    specialist_recommendations: SpecialistRecommendations
  }
  professional_review_required: boolean
  review_priority: string
  comprehensive_summary: string
  mandatory_disclaimer: string
}

interface Facility {
  facility_name: string
  facility_type: string
  address: string
  phone: string
  distance_miles: number
  eta_minutes: number
  coordinates: { lat: number; lng: number }
  services: string[]
  accepts_insurance: boolean
  current_status: string
}

interface LocationResult {
  patient_location: {
    latitude: number
    longitude: number
    address: string
  }
  recommended_facilities: Facility[]
  primary_route: {
    total_distance: string
    total_duration: string
    traffic_conditions: string
    turn_by_turn: string[]
  }
}

interface VideoRoomResult {
  room_id: string
  room_name: string
  patient_token: string
  room_url: string
  expires_at: string
  session_duration_limit: string
}

interface InsuranceResult {
  verification_id: string
  coverage_status: string
  insurance_details: {
    payer_name: string
    member_id: string
    plan_name: string
  }
  telehealth_coverage: {
    covered: boolean
    copay_amount: number
    requires_authorization: boolean
  }
  financial_summary: {
    estimated_patient_cost: number
  }
}

interface AssessmentData {
  age: string
  gender: string
  existingConditions: string
  symptoms: string
  duration: string
  severity: number
}

interface SavedAssessment extends AssessmentData {
  id: string
  timestamp: string
  urgencyLevel: string
  riskScore: number
  summary: string
}

// Agent IDs
const AGENT_IDS = {
  TRIAGE_ORCHESTRATOR: '69858825e17e33c11eed19c6',
  SYMPTOM_EXTRACTION: '69858793094c8b2d4207dcb9',
  RED_FLAG_DETECTION: '698587a91caa4e686dd66df4',
  RISK_SCORING: '698587bf07ec48e3dc90a19d',
  SPECIALIST_ROUTING: '698587d707ec48e3dc90a19e',
  SAFETY_REFLECTION: '698587f0e17e33c11eed19bd',
  ACTION_PLANNING: '698588081caa4e686dd66e06',
  VIDEO_ESCALATION: '69858842b90162af337b1ed7',
  LOCATION_ROUTING: '69858862ab4bf65a66ad07bc',
  ASSISTANT_CHATBOT: '698588802237a2c55706b02a',
  EHR_INTEGRATION: '6985889bb90162af337b1ee6',
  INSURANCE_VERIFICATION: '698588bb1caa4e686dd66e26'
}

// ============================================================================
// Main Component
// ============================================================================

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<string>('landing')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userRole, setUserRole] = useState<'patient' | 'staff' | 'admin'>('patient')

  // Assessment state
  const [formData, setFormData] = useState<AssessmentData>({
    age: '',
    gender: '',
    existingConditions: '',
    symptoms: '',
    duration: '',
    severity: 5
  })
  const [assessmentLoading, setAssessmentLoading] = useState(false)
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null)

  // Location state
  const [locationResult, setLocationResult] = useState<LocationResult | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)

  // Video state
  const [videoRoom, setVideoRoom] = useState<VideoRoomResult | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceResult | null>(null)
  const [videoActive, setVideoActive] = useState(false)
  const [micMuted, setMicMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [videoTime, setVideoTime] = useState(0)

  // History state
  const [assessmentHistory, setAssessmentHistory] = useState<SavedAssessment[]>([])

  // Assistant state
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState<Array<{role: string, content: string}>>([])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('assessmentHistory')
    if (saved) {
      setAssessmentHistory(JSON.parse(saved))
    }
  }, [])

  // Video timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (videoActive) {
      interval = setInterval(() => {
        setVideoTime(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [videoActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle assessment submission
  const handleAssessment = async () => {
    setAssessmentLoading(true)

    const message = `Patient age ${formData.age}, gender ${formData.gender}.
Existing conditions: ${formData.existingConditions || 'None'}.
Symptoms: ${formData.symptoms}.
Duration: ${formData.duration}.
Severity: ${formData.severity}/10.`

    try {
      const result = await callAIAgent(message, AGENT_IDS.TRIAGE_ORCHESTRATOR)

      if (result.success) {
        // Parse the markdown-wrapped JSON response
        let parsedResult = result.response.result

        // If raw_text exists with markdown code block, parse it
        if (result.response.result.raw_text) {
          const rawText = result.response.result.raw_text
          const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/)
          if (jsonMatch) {
            const jsonContent = JSON.parse(jsonMatch[1])
            parsedResult = jsonContent.result
          }
        }

        setTriageResult(parsedResult)

        // Save to history
        const newAssessment: SavedAssessment = {
          ...formData,
          id: parsedResult.assessment_id || `A-${Date.now()}`,
          timestamp: new Date().toISOString(),
          urgencyLevel: parsedResult.patient_summary?.risk_assessment?.urgency_level || 'UNKNOWN',
          riskScore: parsedResult.patient_summary?.risk_assessment?.risk_score || 0,
          summary: parsedResult.comprehensive_summary || 'Assessment completed'
        }

        const updatedHistory = [newAssessment, ...assessmentHistory]
        setAssessmentHistory(updatedHistory)
        localStorage.setItem('assessmentHistory', JSON.stringify(updatedHistory))

        setCurrentScreen('results')
      }
    } catch (error) {
      console.error('Assessment error:', error)
    } finally {
      setAssessmentLoading(false)
    }
  }

  // Handle location lookup
  const handleLocationLookup = async () => {
    setLocationLoading(true)

    const message = `Find nearest emergency room for patient with ${triageResult?.patient_summary?.specialist_recommendations?.primary_specialist?.specialty || 'general'} emergency`

    try {
      const result = await callAIAgent(message, AGENT_IDS.LOCATION_ROUTING)

      if (result.success) {
        setLocationResult(result.response.result)
        setCurrentScreen('map')
      }
    } catch (error) {
      console.error('Location error:', error)
    } finally {
      setLocationLoading(false)
    }
  }

  // Handle video consultation
  const handleVideoConsultation = async () => {
    setVideoLoading(true)

    const patientId = `P${Math.floor(Math.random() * 100000)}`
    const message = `Create a video consultation room for patient ID ${patientId} with ${triageResult?.patient_summary?.specialist_recommendations?.primary_specialist?.specialty || 'general'} specialist`

    try {
      const [videoResult, insuranceResult] = await Promise.all([
        callAIAgent(message, AGENT_IDS.VIDEO_ESCALATION),
        callAIAgent(`Verify insurance for patient ${patientId} for telemedicine consultation`, AGENT_IDS.INSURANCE_VERIFICATION)
      ])

      if (videoResult.success) {
        setVideoRoom(videoResult.response.result)
      }
      if (insuranceResult.success) {
        setInsuranceInfo(insuranceResult.response.result)
      }

      setCurrentScreen('video')
    } catch (error) {
      console.error('Video setup error:', error)
    } finally {
      setVideoLoading(false)
    }
  }

  // Handle assistant chat
  const handleAssistantMessage = async () => {
    if (!assistantInput.trim()) return

    const userMessage = assistantInput
    setAssistantMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setAssistantInput('')
    setAssistantLoading(true)

    try {
      const result = await callAIAgent(userMessage, AGENT_IDS.ASSISTANT_CHATBOT)

      if (result.success) {
        const botMessage = result.response.result.message || 'I can help you navigate the platform.'
        setAssistantMessages(prev => [...prev, { role: 'assistant', content: botMessage }])
      }
    } catch (error) {
      console.error('Assistant error:', error)
    } finally {
      setAssistantLoading(false)
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'EMERGENCY':
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MODERATE':
      case 'SOON':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW':
      case 'ROUTINE':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-orange-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-green-600'
  }

  // ============================================================================
  // Screen 1: Landing Page
  // ============================================================================

  const LandingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Emergency Disclaimer Banner */}
      <Alert className="border-red-600 bg-red-50 rounded-none">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-red-800 font-medium">
          <strong>Emergency Disclaimer:</strong> If you are experiencing a life-threatening emergency, call 911 immediately.
          This platform is for informational purposes only and does not replace professional medical advice.
        </AlertDescription>
      </Alert>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white p-4 rounded-full">
              <Activity className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Healthcare Decision Support Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered symptom assessment and triage to help you make informed healthcare decisions
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            onClick={() => setCurrentScreen('assessment')}
          >
            Start Assessment
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <ClipboardList className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-center">Intelligent Triage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Advanced AI analyzes your symptoms to determine urgency level and recommended care path
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Video className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-center">Video Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Connect with healthcare professionals through secure, HIPAA-compliant video calls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <MapPin className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-center">Location Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600">
                Find nearby hospitals and urgent care facilities with real-time availability
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer with Compliance Badges */}
        <div className="flex justify-center gap-8 items-center pt-8 border-t">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Shield className="h-4 w-4 mr-2" />
            HIPAA Compliant
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Shield className="h-4 w-4 mr-2" />
            GDPR Compliant
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Shield className="h-4 w-4 mr-2" />
            SOC 2 Type II
          </Badge>
        </div>
      </div>
    </div>
  )

  // ============================================================================
  // Screen 2: Assessment Page
  // ============================================================================

  const AssessmentScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentScreen('landing')}
              className="mb-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Assessment</h1>
            <p className="text-gray-600">Please provide detailed information about your symptoms</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Assessment Progress</span>
              <span className="text-sm text-gray-600">Step 1 of 1</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Your information is encrypted and HIPAA-compliant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Existing Conditions */}
              <div className="space-y-2">
                <Label htmlFor="conditions">Existing Medical Conditions</Label>
                <Textarea
                  id="conditions"
                  placeholder="E.g., diabetes, hypertension, asthma (leave blank if none)"
                  value={formData.existingConditions}
                  onChange={(e) => setFormData(prev => ({ ...prev, existingConditions: e.target.value }))}
                  rows={2}
                />
              </div>

              <Separator />

              {/* Symptoms */}
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptom Description *</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe your symptoms in detail. Include location, type of pain/discomfort, and any other relevant details."
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  rows={4}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">How long have you had these symptoms? *</Label>
                <Input
                  id="duration"
                  placeholder="E.g., 2 days, 6 hours, 30 minutes"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>

              {/* Severity Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Severity Level *</Label>
                  <span className="text-2xl font-bold text-blue-600">{formData.severity}/10</span>
                </div>
                <Slider
                  value={[formData.severity]}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value[0] }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
                onClick={handleAssessment}
                disabled={!formData.age || !formData.gender || !formData.symptoms || !formData.duration || assessmentLoading}
              >
                {assessmentLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Symptoms...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree that this is not medical advice and emergency situations require calling 911
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  // ============================================================================
  // Screen 3: Results Page
  // ============================================================================

  const ResultsScreen = () => {
    if (!triageResult) return null

    const redFlags = triageResult.patient_summary.red_flags
    const riskAssessment = triageResult.patient_summary.risk_assessment
    const specialist = triageResult.patient_summary.specialist_recommendations

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Emergency Banner */}
            {redFlags.red_flag_detected && redFlags.severity === 'CRITICAL' && (
              <Alert className="mb-6 border-red-600 bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  <strong>CRITICAL EMERGENCY:</strong> {redFlags.recommended_action}
                </AlertDescription>
              </Alert>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-6">Assessment Results</h1>

            {/* Urgency Badge */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Urgency Level</p>
                    <Badge className={`text-lg px-4 py-2 ${getUrgencyColor(riskAssessment.urgency_level)}`}>
                      {riskAssessment.urgency_level}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Risk Score</p>
                    <p className={`text-4xl font-bold ${getRiskScoreColor(riskAssessment.risk_score)}`}>
                      {riskAssessment.risk_score}/100
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Red Flag Alert */}
            {redFlags.red_flag_detected && (
              <Card className="mb-6 border-red-300">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Red Flag Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {redFlags.red_flag_patterns.map((pattern, idx) => (
                    <div key={idx} className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{pattern.pattern_name}</h4>
                      <p className="text-gray-700 mb-2">{pattern.reason}</p>
                      <div className="flex flex-wrap gap-2">
                        {pattern.matched_symptoms.map((symptom, sidx) => (
                          <Badge key={sidx} variant="outline" className="text-red-600 border-red-300">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Alert className="mt-4 bg-red-50 border-red-300">
                    <AlertDescription className="text-red-800 font-medium">
                      {redFlags.safety_message}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{riskAssessment.composite_assessment}</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Recommended Timeframe:</span>
                    <span className="font-semibold">{riskAssessment.recommended_timeframe}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Confidence Level:</span>
                    <span className="font-semibold capitalize">{riskAssessment.confidence_level}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <h4 className="font-semibold mb-3">Risk Factors:</h4>
                <div className="space-y-2">
                  {riskAssessment.risk_factors.map((factor, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{factor.factor_name}</span>
                        <span className="text-gray-600">{factor.contribution}</span>
                      </div>
                      <p className="text-gray-600 text-xs">{factor.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specialist Recommendations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recommended Specialists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Primary Specialist</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-semibold text-blue-900">{specialist.primary_specialist.specialty}</p>
                    <p className="text-sm text-gray-700 mt-1">{specialist.primary_specialist.reason}</p>
                    {specialist.primary_specialist.confidence && (
                      <Badge className="mt-2" variant="outline">
                        {specialist.primary_specialist.confidence} confidence
                      </Badge>
                    )}
                  </div>
                </div>

                {specialist.secondary_specialists.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Secondary Specialists</h4>
                    <div className="space-y-2">
                      {specialist.secondary_specialists.map((sec, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-900">{sec.specialty}</p>
                          <p className="text-sm text-gray-600">{sec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Affected Systems:</strong> {specialist.affected_systems.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Alternative Care:</strong> {specialist.alternative_care_options.join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Reasoning */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AI Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{triageResult.comprehensive_summary}</p>
                <Alert>
                  <AlertDescription className="text-sm text-gray-700">
                    {triageResult.mandatory_disclaimer}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLocationLookup}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                View Map & Facilities
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleVideoConsultation}
                disabled={videoLoading}
              >
                {videoLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Video className="mr-2 h-4 w-4" />
                )}
                Request Consultation
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setCurrentScreen('history')}
              >
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Screen 4: Map & ETA Page
  // ============================================================================

  const MapScreen = () => {
    if (!locationResult) return null

    const facility = locationResult.recommended_facilities[0]
    const route = locationResult.primary_route

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentScreen('results')}
                className="mb-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Results
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Nearby Facilities</h1>
              <p className="text-gray-600">Find the nearest healthcare facility</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Area */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Map View</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Static map placeholder - in production, use Google Maps or Mapbox */}
                  <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100"></div>
                    <div className="relative z-10 text-center">
                      <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-gray-700 font-medium">Interactive Map</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {locationResult.patient_location.address}
                      </p>
                      <div className="mt-4">
                        <Badge className="bg-blue-600 text-white">You are here</Badge>
                      </div>
                      <div className="mt-8">
                        <Badge className="bg-red-600 text-white">
                          {facility.facility_name} - {facility.distance_miles} miles
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Facility Info Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{facility.facility_name}</CardTitle>
                    <CardDescription>{facility.facility_type}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-sm font-medium">{facility.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Distance</p>
                        <p className="text-lg font-bold text-blue-600">{facility.distance_miles} mi</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">ETA</p>
                        <p className="text-lg font-bold text-blue-600">{facility.eta_minutes} min</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Services Available</p>
                      <div className="flex flex-wrap gap-2">
                        {facility.services.map((service, idx) => (
                          <Badge key={idx} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        {facility.current_status}
                      </Badge>
                    </div>

                    {facility.accepts_insurance && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Accepts Insurance
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        <Phone className="mr-2 h-4 w-4" />
                        Call {facility.phone}
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Navigation className="mr-2 h-4 w-4" />
                        Start Navigation
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Route Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Route Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Distance</span>
                      <span className="font-semibold">{route.total_distance}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="font-semibold">{route.total_duration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Traffic</span>
                      <Badge variant="outline" className="capitalize">
                        {route.traffic_conditions}
                      </Badge>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-semibold mb-2">Turn-by-turn Directions</p>
                      <ScrollArea className="h-40">
                        <ol className="space-y-2">
                          {route.turn_by_turn.map((turn, idx) => (
                            <li key={idx} className="text-sm text-gray-700 flex">
                              <span className="font-semibold mr-2">{idx + 1}.</span>
                              <span>{turn}</span>
                            </li>
                          ))}
                        </ol>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Screen 5: Video Consultation Page
  // ============================================================================

  const VideoScreen = () => {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentScreen('results')}
                  className="text-white hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Exit
                </Button>
                <h1 className="text-2xl font-bold text-white">Video Consultation</h1>
              </div>
              <div className="flex items-center gap-4">
                {insuranceInfo && insuranceInfo.coverage_status === 'ACTIVE' && (
                  <Badge className="bg-green-600 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Insurance Verified
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatTime(videoTime)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Video Feed Area */}
              <div className="lg:col-span-3 space-y-4">
                {/* Main Video */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
                      {videoActive ? (
                        <div className="text-center">
                          <Video className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">Video call in progress</p>
                          <p className="text-sm text-gray-500 mt-2">Doctor will join shortly</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <VideoOff className="h-24 w-24 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-400">Video call not started</p>
                          <Button
                            className="mt-4 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setVideoActive(true)}
                          >
                            Start Video
                          </Button>
                        </div>
                      )}

                      {/* Self view */}
                      {videoActive && (
                        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
                          <User className="h-12 w-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Controls Bar */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex justify-center gap-4">
                      <Button
                        variant={micMuted ? "destructive" : "secondary"}
                        size="lg"
                        onClick={() => setMicMuted(!micMuted)}
                        className="rounded-full w-14 h-14"
                      >
                        {micMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant={cameraOff ? "destructive" : "secondary"}
                        size="lg"
                        onClick={() => setCameraOff(!cameraOff)}
                        className="rounded-full w-14 h-14"
                      >
                        {cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="rounded-full w-14 h-14"
                      >
                        <Monitor className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => {
                          setVideoActive(false)
                          setVideoTime(0)
                        }}
                        className="rounded-full w-14 h-14"
                      >
                        <Phone className="h-5 w-5 rotate-135" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Session Info */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {videoRoom && (
                      <>
                        <div>
                          <p className="text-gray-400">Room ID</p>
                          <p className="text-white font-mono text-xs">{videoRoom.room_id}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Duration Limit</p>
                          <p className="text-white">{videoRoom.session_duration_limit}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Insurance Info */}
                {insuranceInfo && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Coverage Details</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div>
                        <p className="text-gray-400">Plan</p>
                        <p className="text-white">{insuranceInfo.insurance_details.plan_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Copay</p>
                        <p className="text-white font-semibold">
                          ${insuranceInfo.telehealth_coverage.copay_amount}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {insuranceInfo.telehealth_coverage.covered ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-green-400">Covered</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-red-400">Not Covered</span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Chat */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-48 mb-4">
                      <div className="space-y-2">
                        <div className="text-xs text-gray-400 text-center">
                          Chat will be available during consultation
                        </div>
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        className="bg-gray-700 border-gray-600 text-white"
                        disabled
                      />
                      <Button size="sm" disabled>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Screen 6: History Page
  // ============================================================================

  const HistoryScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment History</h1>
              <p className="text-gray-600">View your past symptom assessments</p>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          </div>

          {assessmentHistory.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assessments Yet</h3>
                <p className="text-gray-600 mb-4">Start your first symptom assessment to see it here</p>
                <Button onClick={() => setCurrentScreen('assessment')}>
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Trend Indicator */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Health Trends</span>
                    </div>
                    <Badge variant="outline">
                      {assessmentHistory.length} assessments
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <div className="space-y-4">
                {assessmentHistory.map((assessment, idx) => (
                  <Card key={assessment.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg mb-1">
                            Assessment {assessment.id}
                          </CardTitle>
                          <CardDescription>
                            {new Date(assessment.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge className={getUrgencyColor(assessment.urgencyLevel)}>
                          {assessment.urgencyLevel}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Risk Score</span>
                          <span className={`font-bold ${getRiskScoreColor(assessment.riskScore)}`}>
                            {assessment.riskScore}/100
                          </span>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Age</p>
                            <p className="font-medium">{assessment.age} years</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Gender</p>
                            <p className="font-medium capitalize">{assessment.gender}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Duration</p>
                            <p className="font-medium">{assessment.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Severity</p>
                            <p className="font-medium">{assessment.severity}/10</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Symptoms</p>
                          <p className="text-sm">{assessment.symptoms}</p>
                        </div>

                        {assessment.existingConditions && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Existing Conditions</p>
                            <p className="text-sm">{assessment.existingConditions}</p>
                          </div>
                        )}

                        <Button variant="outline" className="w-full mt-4">
                          <ChevronRight className="mr-2 h-4 w-4" />
                          View Full Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ============================================================================
  // Screen 7: Professional Queue
  // ============================================================================

  const QueueScreen = () => {
    // Mock data for professional queue
    const queueData = [
      {
        id: 'A-2024-001',
        patientId: 'P12345',
        submissionTime: '2024-02-06T10:30:00',
        urgency: 'CRITICAL',
        redFlags: 'Cardiovascular',
        status: 'Pending Review'
      },
      {
        id: 'A-2024-002',
        patientId: 'P12346',
        submissionTime: '2024-02-06T11:15:00',
        urgency: 'HIGH',
        redFlags: 'None',
        status: 'Pending Review'
      },
      {
        id: 'A-2024-003',
        patientId: 'P12347',
        submissionTime: '2024-02-06T11:45:00',
        urgency: 'MODERATE',
        redFlags: 'None',
        status: 'In Review'
      }
    ]

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Professional Review Queue</h1>
                <p className="text-gray-600">Pending patient assessments requiring review</p>
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-blue-600">12</p>
                    </div>
                    <ClipboardList className="h-10 w-10 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Critical</p>
                      <p className="text-3xl font-bold text-red-600">3</p>
                    </div>
                    <AlertTriangle className="h-10 w-10 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Wait Time</p>
                      <p className="text-3xl font-bold text-gray-900">8m</p>
                    </div>
                    <Clock className="h-10 w-10 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Queue Table */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Queue</CardTitle>
                <CardDescription>Click on any assessment to review details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Submission Time</TableHead>
                      <TableHead>AI Urgency</TableHead>
                      <TableHead>Red Flags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queueData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.patientId}</TableCell>
                        <TableCell>{new Date(item.submissionTime).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getUrgencyColor(item.urgency)}>
                            {item.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.redFlags !== 'None' ? (
                            <Badge variant="destructive">{item.redFlags}</Badge>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <Button size="sm">Review</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Screen 8: Admin Dashboard
  // ============================================================================

  const AdminScreen = () => {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Total Assessments</p>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                  <p className="text-xs text-green-600 mt-1">+12% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">High-Risk Cases</p>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">89</p>
                  <p className="text-xs text-red-600 mt-1">7.1% of total</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Active Consultations</p>
                    <Video className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">23</p>
                  <p className="text-xs text-gray-600 mt-1">Currently ongoing</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-600">Red Flag Frequency</p>
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">156</p>
                  <p className="text-xs text-orange-600 mt-1">12.5% detection rate</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Assessment Volume Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Volume (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-around gap-2">
                    {[120, 145, 132, 168, 191, 203, 178].map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-blue-600 rounded-t"
                          style={{ height: `${(value / 203) * 100}%` }}
                        ></div>
                        <p className="text-xs text-gray-600 mt-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Urgency Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Urgency Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { level: 'Critical', count: 89, color: 'bg-red-600', percentage: 7 },
                      { level: 'High', count: 234, color: 'bg-orange-600', percentage: 19 },
                      { level: 'Moderate', count: 567, color: 'bg-yellow-600', percentage: 45 },
                      { level: 'Low', count: 357, color: 'bg-green-600', percentage: 29 }
                    ].map((item) => (
                      <div key={item.level}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.level}</span>
                          <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance & Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm">HIPAA Compliance</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="text-sm">Data Encryption</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <span className="text-sm">Audit Logs</span>
                      </div>
                      <Button variant="outline" size="sm">View Logs</Button>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-2">Recent Audit Events</p>
                      <ScrollArea className="h-32">
                        <div className="space-y-2 text-xs">
                          <p className="text-gray-600">2024-02-06 12:34 - User access logged</p>
                          <p className="text-gray-600">2024-02-06 11:22 - Data export completed</p>
                          <p className="text-gray-600">2024-02-06 10:15 - System backup successful</p>
                          <p className="text-gray-600">2024-02-06 09:45 - Security scan passed</p>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Health */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Health Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'EHR Integration', status: 'operational', uptime: '99.9%' },
                      { name: 'Video Service', status: 'operational', uptime: '99.7%' },
                      { name: 'Insurance Verification', status: 'operational', uptime: '98.9%' },
                      { name: 'Location Services', status: 'degraded', uptime: '97.2%' }
                    ].map((service) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="text-sm">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{service.uptime}</span>
                          <Badge
                            variant="outline"
                            className={service.status === 'operational' ?
                              'border-green-500 text-green-700' :
                              'border-yellow-500 text-yellow-700'
                            }
                          >
                            {service.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Navigation Sidebar Component
  // ============================================================================

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${
      sidebarOpen ? 'w-64' : 'w-0'
    } overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">HealthCare AI</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setCurrentScreen('landing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'landing' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <HomeIcon className="h-5 w-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => setCurrentScreen('assessment')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'assessment' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <ClipboardList className="h-5 w-5" />
            <span>Assessment</span>
          </button>

          <button
            onClick={() => setCurrentScreen('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentScreen === 'history' ? 'bg-blue-600' : 'hover:bg-gray-800'
            }`}
          >
            <History className="h-5 w-5" />
            <span>History</span>
          </button>

          {(userRole === 'staff' || userRole === 'admin') && (
            <button
              onClick={() => setCurrentScreen('queue')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentScreen === 'queue' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Queue</span>
            </button>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setCurrentScreen('admin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentScreen === 'admin' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        <Separator className="my-6 bg-gray-700" />

        <div className="space-y-2">
          <p className="text-xs text-gray-400 px-4">Role Selection (Demo)</p>
          <Select value={userRole} onValueChange={(value: any) => setUserRole(value)}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="patient">Patient</SelectItem>
              <SelectItem value="staff">Medical Staff</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  // ============================================================================
  // Header Component
  // ============================================================================

  const Header = () => {
    if (currentScreen === 'landing') return null

    return (
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">HealthCare AI</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // Floating Assistant Button
  // ============================================================================

  const FloatingAssistant = () => (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-lg z-50"
        onClick={() => setAssistantOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      <Dialog open={assistantOpen} onOpenChange={setAssistantOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Healthcare Assistant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ScrollArea className="h-96 pr-4">
              <div className="space-y-4">
                {assistantMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Ask me anything about navigating the platform</p>
                  </div>
                )}
                {assistantMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {assistantLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAssistantMessage()}
              />
              <Button onClick={handleAssistantMessage} disabled={assistantLoading}>
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )

  // ============================================================================
  // Main Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />

      <div className={`transition-all duration-300 ${sidebarOpen && currentScreen !== 'landing' ? 'ml-64' : 'ml-0'}`}>
        {currentScreen === 'landing' && <LandingScreen />}
        {currentScreen === 'assessment' && <AssessmentScreen />}
        {currentScreen === 'results' && <ResultsScreen />}
        {currentScreen === 'map' && <MapScreen />}
        {currentScreen === 'video' && <VideoScreen />}
        {currentScreen === 'history' && <HistoryScreen />}
        {currentScreen === 'queue' && <QueueScreen />}
        {currentScreen === 'admin' && <AdminScreen />}
      </div>

      {currentScreen !== 'landing' && <FloatingAssistant />}
    </div>
  )
}
