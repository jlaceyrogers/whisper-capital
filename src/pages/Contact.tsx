import ContactHero from '@/pages/contact/ContactHero'
import InquiryForm from '@/pages/contact/InquiryForm'
import DirectLines from '@/pages/contact/DirectLines'
import ComplianceBand from '@/pages/contact/ComplianceBand'

/**
 * Contact — dark hero bookend → ivory contact form → dark direct
 * lines → forest-1000 compliance band. Global footer follows via Layout.
 */
export default function Contact() {
  return (
    <>
      <ContactHero />
      <InquiryForm />
      <DirectLines />
      <ComplianceBand />
    </>
  )
}
