import Navbar from '../../components/Navbar/Navbar'
import Footer from '../../components/Footer/Footer'
import './Give.css'

const ACCOUNTS = [
  { id:'gcb',     label:'Bank transfer · GCB Bank',  name:'TRC Ministries',  number:'1234 5678 90', sub:'GCB Bank · Accra Main Branch',     mod:'brand'  },
  { id:'mtn',     label:'MTN Mobile Money',           name:'TRC Ministries',  number:'024 456 7890', sub:'MTN MoMo merchant wallet',         mod:'gold'   },
  { id:'voda',    label:'Vodafone Cash',               name:'TRC Ministries',  number:'020 123 4567', sub:'Vodafone merchant wallet',         mod:'purple' },
  { id:'airtel',  label:'AirtelTigo Money',            name:'TRC Ministries',  number:'027 987 6543', sub:'AirtelTigo merchant wallet',       mod:'teal'   },
]

const CATEGORIES = ['Tithe', 'Sunday offering', 'Building fund', 'Missions', 'Youth ministry', 'Welfare fund']

function Give() {
  return (
    <div className="give">
      <Navbar />
      <section className="give__hero">
        <div className="give__hero-deco give__hero-deco--1" aria-hidden="true" />
        <div className="give__hero-deco give__hero-deco--2" aria-hidden="true" />
        <div className="give__hero-inner">
          <p className="give__hero-eyebrow">Support the ministry</p>
          <h1 className="give__hero-title">Give to TRC Ministries</h1>
          <p className="give__hero-sub">Your giving supports the work of God in our community and beyond. Use any of the accounts below to give. Every seed matters.</p>
        </div>
      </section>

      <section className="give__body">
        <div className="give__section-title">Giving accounts</div>
        <div className="give__accounts-grid">
          {ACCOUNTS.map(({ id, label, name, number, sub, mod }) => (
            <div key={id} className={`give__account give__account--${mod}`}>
              <p className="give__account-label">{label}</p>
              <p className="give__account-name">{name}</p>
              <p className={`give__account-number give__account-number--${mod}`}>{number}</p>
              <p className="give__account-sub">{sub}</p>
            </div>
          ))}
        </div>

        <div className="give__categories-section">
          <div className="give__section-title">Giving categories</div>
          <p className="give__categories-hint">When making a transfer please include the giving category in your reference or narration.</p>
          <div className="give__categories">
            {CATEGORIES.map((c) => <span key={c} className="give__category-pill">{c}</span>)}
          </div>
        </div>

        <div className="give__note">
          <div className="give__note-icon" aria-hidden="true">✦</div>
          <p className="give__note-text">
            After giving, kindly notify your cell leader or contact the church office on
            <strong> 030 123 4567</strong> or <strong>info@trcministries.org</strong>.
            Thank you for your faithfulness and generosity.
          </p>
        </div>

        <div className="give__scripture">
          <p className="give__scripture-text">"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."</p>
          <p className="give__scripture-ref">2 Corinthians 9:7</p>
        </div>
      </section>
      <Footer />
    </div>
  )
}
export default Give
