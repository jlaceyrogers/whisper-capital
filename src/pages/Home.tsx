import { useCallback, useEffect, useState } from 'react'
import Preloader from '@/components/Preloader'
import Hero from '@/pages/home/Hero'
import DualEngine from '@/pages/home/DualEngine'
import ByTheNumbers from '@/pages/home/ByTheNumbers'

export default function Home() {
  const [revealed, setRevealed] = useState(() => !!sessionStorage.getItem('whisper-preloaded'))

  const handleDone = useCallback(() => {
    sessionStorage.setItem('whisper-preloaded', '1')
    setRevealed(true)
  }, [])

  // lock scroll while the preloader is up
  useEffect(() => {
    document.body.style.overflow = revealed ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [revealed])

  return (
    <>
      {!revealed && <Preloader onDone={handleDone} />}
      <Hero revealed={revealed} />
      <DualEngine />
      <ByTheNumbers />
    </>
  )
}
