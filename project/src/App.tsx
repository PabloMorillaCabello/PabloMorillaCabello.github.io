import { useEffect, useState, useCallback, useRef } from 'react'
import { GithubIcon, LinkedinIcon, InstagramIcon, MailIcon, PhoneIcon, MapPinIcon, TrophyIcon } from 'lucide-react'

const timelineEvents = [
  {
    year: '2001',
    type: 'personal',
    left: null,
    right: {
      title: 'Early Years',
      description: 'Born and raised in Málaga, Spain',
      company: 'Málaga'
    }
  },
  {
    year: '2019 - 2024',
    type: 'education',
    left: {
      title: 'Robotics & Mechatronics Degree',
      description: 'Specialized in robotics, electronics, and automation. GPA: 7.31/10',
      company: 'University of Málaga'
    },
    right: null
  },
  {
    year: '2023',
    type: 'education',
    left: null,
    right: {
      title: 'Exchange Studies',
      description: 'Industrial Control Engineering, Industrial Robotics, and Logistics Simulation. GPA: 2.65/4',
      company: 'Högskolan i Skövde (ERASMUS)'
    }
  },
  {
    year: '2023',
    type: 'work',
    left: {
      title: 'Research Assistant',
      description: 'Developed software for robotic systems and contributed to a published paper.',
      company: 'ASSAR Industrial Innovation Arena, Skövde, Sweden'
    },
    right: null
  },
  {
    year: '2024 - Present',
    type: 'work',
    left: null,
    right: {
      title: 'Automation Engineer',
      description: 'Working with industrial robot programming and PLC automation. Providing support to companies like Volvo Group, SCANIA, and Hitachi.',
      company: 'Elektroautomatik, Skövde, Sweden'
    }
  }
]

const projects = [
  {
    title: 'AGV Digital Twin',
    description: 'This project aims to develop a solution for integrating various software systems using OPC UA standards. It focuses on simulating the functionality of an AGV in a virtual environment, incorporating control capabilities for path planning and collision avoidance while providing a user-friendly remote control interface.',
    tech: 'C, JavaScript, MongoDB, NodeRed, RobotSudio, Codesys, OPC-UA.',
    year: '2024'
  },
  {
    title: 'Mobile Robotic Lab',
    description: 'Robot project utilizing a PIERO mobile robot, equipped with sensors and a drive system. Programmed using an Arduino Mega in MATLAB, enabling the implementation of advanced control strategies, including path planning and collision avoidance.',
    tech: 'Matlab, SimuLink, Arduino.',
    year: '2024'
  },
    {
    title: 'ULTRA-ADDIN',
    description: 'Development of an ADD-IN for RobotStudio software to create an interface that ensures modularization and interface standardization while maintaining a user-friendly system. This enhances the approach to exploring the synergies between modularization, interface standardization, and service-orientation in production system simulation.',
    tech: ' C#, RobotStudio, Python.',
    year: '2023'
  }
]

const publications = [
  {
    title: 'Exploring the Synergies of Modularization, Interface Standardization,and Service-Orientation in Production System Simulation',
    journal: 'Martin Birtic, Pablo Morilla Cabello, ´Angel Mu˜n´oz, Anna Syberfeldt',
    description: 'DOI: 10.3233/ATDE240164 2 ',
    year: '2024'
  }
]

function App() {
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const [showJourney, setShowJourney] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const timelineItemsRef = useRef<(HTMLDivElement | null)[]>([])
  const animationFrameRef = useRef<number | null>(null);
  const lastScrollY = useRef(0)
  const scrollingUp = useRef(false)
  const debugMode = false

  useEffect(() => {
    // Trigger entrance animations after a short delay
    const profileTimer = setTimeout(() => setShowProfile(true), 300)
    const journeyTimer = setTimeout(() => setShowJourney(true), 600)

    return () => {
      clearTimeout(profileTimer)
      clearTimeout(journeyTimer)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const maxScroll = documentHeight - windowHeight
      
      // Detect scroll direction
      scrollingUp.current = scrollPosition < lastScrollY.current
      lastScrollY.current = scrollPosition

      if (maxScroll <= 0) {
        setScrollPercentage(0)
        return
      }

      const calculated = (scrollPosition / maxScroll) * 100
      setScrollPercentage(Math.min(Math.max(calculated, 0), 100))

      // Check visibility of timeline items
      timelineItemsRef.current.forEach((item, index) => {
        if (!item) return

        const rect = item.getBoundingClientRect()
        const isVisible = rect.top < windowHeight * 0.8 && rect.bottom >= 0

        setVisibleItems(prev => {
          if (isVisible && !prev.includes(index)) {
            return [...prev, index]
          } else if (!isVisible && prev.includes(index)) {
            return prev.filter(i => i !== index)
          }
          return prev
        })
      })
    })
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleScroll])

  const images = [
    'https://plus.unsplash.com/premium_photo-1697729549014-2faefb25efba?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFsYWdhfGVufDB8fDB8fHww',
    'https://images.unsplash.com/photo-1562774053-701939374585',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
  ]

  const getBackgroundStyles = (index: number) => {
    const threshold = 30
    const position = index * threshold
    let opacity = 1

    if (scrollPercentage < position) {
      opacity = Math.max(0, 1 - (position - scrollPercentage) / threshold)
    } else if (scrollPercentage > position + threshold) {
      opacity = Math.max(0, 1 - (scrollPercentage - (position + threshold)) / threshold)
    }

    return {
      opacity,
      backgroundImage: `linear-gradient(rgba(0, 0, 0, ${0.4 + (index * 0.1)}), rgba(0, 0, 0, ${0.4 + (index * 0.1)})), url(${images[index]}?auto=format&fit=crop&w=2000&q=80)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      zIndex: -1,
    }
  }

  const getTimelineItemStyle = (type: string) => {
    switch (type) {
      case 'education':
        return 'bg-white/95 border-indigo-200'
      case 'work':
        return 'bg-white/95 border-emerald-200'
      default:
        return 'bg-white/95 border-gray-200'
    }
  }

  const getYearLabelStyle = (type: string) => {
    switch (type) {
      case 'education':
        return 'bg-indigo-600/90 text-white'
      case 'work':
        return 'bg-emerald-600/90 text-white'
      default:
        return 'bg-gray-600/90 text-white'
    }
  }

  const getSlideAnimation = (isLeft: boolean) => {
    const direction = isLeft ? '-' : ''
    return `transform transition-all duration-700 ease-in-out translate-x-[${direction}100%] opacity-0 group-[.visible]:translate-x-0 group-[.visible]:opacity-100`
  }

  const getTimelineLineAnimation = (isVisible: boolean) => {
    return `absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-white/20 transition-all duration-1000 ease-in-out origin-top ${isVisible ? 'h-full' : 'h-0'}`
  }

  return (
    <div className="relative">
      {/* Background layers */}
      {images.map((_, index) => (
        <div
          key={index}
          className="fixed inset-0 w-full h-full transition-opacity duration-700 ease-in-out"
          style={getBackgroundStyles(index)}
        />
      ))}

      {debugMode && (
        <div className="fixed top-0 right-0 bg-black/80 text-white p-4 z-50 font-mono text-sm">
          Scroll: {scrollPercentage.toFixed(2)}%
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-48 pb-16"> {/* Updated padding top here */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div 
              className={`w-48 h-48 rounded-full overflow-hidden flex-shrink-0 shadow-xl transform transition-all duration-1000 ease-out ${
                showProfile ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}
            >
              <img
                src="https://media.licdn.com/dms/image/v2/D4E03AQHqKo5ZZkixCg/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1667851155178?e=1750896000&v=beta&t=zx0aH0e9M1TOAhCOqhN3rWAWVsedfy-LikeD_o77q_k"
                alt="Pablo Morilla Cabello"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            <div 
              className={`flex-1 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg transform transition-all duration-1000 ease-out ${
                showProfile ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
              }`}
            >
              <h1 className="text-4xl font-bold mb-4">Pablo Morilla Cabello</h1>
              <p className="text-xl text-gray-600 mb-6">
               Hi, I'm Pablo, an Automation Engineer from Málaga, Spain. I specialize in optimizing industrial processes through smart control systems and automation technologies. With a strong technical background and fluency in English, I've worked across different environments, always aiming to deliver efficient, reliable solutions.

Currently, I'm also learning Swedish and enjoying the journey of growing both personally and professionally. I'm passionate about problem-solving, continuous improvement, and making systems work better.
              </p>
              <div className="flex gap-4">
                <a href="https://github.com/PabloMorillaCabello" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <GithubIcon className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/pablomorillacabello/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <LinkedinIcon className="w-6 h-6" />
                </a>
                <a href="https://www.instagram.com/morillapablo/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a href="mailto:pablomorillacabello@gmail.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <MailIcon className="w-6 h-6" />
                </a>
                <a href="tel:+34626171323" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <PhoneIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="container mx-auto px-4 py-32">
          <div 
            className={`flex items-center justify-center gap-8 mb-24 transform transition-all duration-1000 ease-out ${
              showJourney ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
            }`}
          >
            <h2 className="text-4xl font-bold text-white">My Journey</h2>
            <div className="flex gap-6">
              <div className="flex items-center gap-3 bg-indigo-600/80 px-4 py-2 rounded-full">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-white font-medium">Education</span>
              </div>
              <div className="flex items-center gap-3 bg-emerald-600/80 px-4 py-2 rounded-full">
                <div className="w-3 h-3 rounded-full bg-white"></div>
                <span className="text-white font-medium">Work Experience</span>
              </div>
            </div>
          </div>
          
          <div className="relative" ref={timelineRef}>
            {/* Timeline line */}
            <div className={getTimelineLineAnimation(visibleItems.length > 0)}></div>

            {/* Timeline events */}
            {timelineEvents.map((event, index) => (
              <div 
                key={index}
                ref={(el) => {
                  timelineItemsRef.current[index] = el;
                }}
                className={`timeline-item relative mb-32 group ${
                  visibleItems.includes(index) ? 'visible' : ''
                }`}
              >
                {/* Achievement marker */}
                <div className={`absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-3 z-10 shadow-md transition-all duration-700 ease-in-out scale-0 opacity-0 group-[.visible]:scale-100 group-[.visible]:opacity-100 ${
                  event.type === 'education' ? 'ring-4 ring-indigo-200' : event.type === 'work' ? 'ring-4 ring-emerald-200' : 'ring-4 ring-gray-200'
                }`}>
                  <TrophyIcon className={`w-6 h-6 ${
                    event.type === 'education' ? 'text-indigo-600' : event.type === 'work' ? 'text-emerald-600' : 'text-gray-600'
                  }`} />
                </div>

                <div className="grid grid-cols-2 gap-16">
                  {/* Left event */}
                  <div className={`text-right ${!event.left && 'invisible'}`}>
                    {event.left && (
                      <div className={`p-8 backdrop-blur-sm rounded-xl shadow-md border max-w-xl ml-auto min-h-[220px] ${getTimelineItemStyle(event.type)} ${getSlideAnimation(true)}`}>
                        <h3 className="text-2xl font-semibold mb-4">{event.left.title}</h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">{event.left.description}</p>
                        <p className="text-base font-medium text-gray-500">{event.left.company}</p>
                      </div>
                    )}
                  </div>

                  {/* Right event */}
                  <div className={`text-left ${!event.right && 'invisible'}`}>
                    {event.right && (
                      <div className={`p-8 backdrop-blur-sm rounded-xl shadow-md border max-w-xl min-h-[220px] ${getTimelineItemStyle(event.type)} ${getSlideAnimation(false)}`}>
                        <h3 className="text-2xl font-semibold mb-4">{event.right.title}</h3>
                        <p className="text-gray-600 text-lg leading-relaxed mb-4">{event.right.description}</p>
                        <p className="text-base font-medium text-gray-500">{event.right.company}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Year display */}
                <div className={`absolute top-0 ${event.right ? 'right-[calc(50%+4rem)]' : 'left-[calc(50%+4rem)]'} ${getYearLabelStyle(event.type)} px-6 py-3 rounded-full shadow-md ${getSlideAnimation(event.right ? false : true)}`}>
                  <span className="text-lg font-bold">{event.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white/90 backdrop-blur-sm py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Projects</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">{project.tech}</span>
                    <span className="text-sm text-gray-500">{project.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Publications Section */}
        <div className="bg-gray-50/90 backdrop-blur-sm py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Publications</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {publications.map((publication, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900">{publication.title}</h3>
                  <p className="text-gray-600 mt-2">{publication.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600">{publication.journal}</span>
                    <span className="text-sm text-gray-500">{publication.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white/95 backdrop-blur-sm py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Contact</h2>
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <MapPinIcon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">Skövde, Sweden</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <PhoneIcon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone</h3>
                    <a href="tel:+46123456789" className="text-gray-600 hover:text-gray-900">+46 123 456 789</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MailIcon className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <a href="mailto:pablo@example.com" className="text-gray-600 hover:text-gray-900">pablo@example.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-4">
                    <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                      <GithubIcon className="w-6 h-6" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                      <LinkedinIcon className="w-6 h-6" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                      <InstagramIcon className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App