import Card from './ui/Card'
import Button from './ui/Button'
import { SubscriptionPlan } from '@/types'

interface SubscriptionCardProps {
  plan: SubscriptionPlan
  isPopular?: boolean
  onSelect?: (plan: SubscriptionPlan) => void
}

export default function SubscriptionCard({ 
  plan, 
  isPopular = false,
  onSelect 
}: SubscriptionCardProps) {
  return (
    <Card className={`relative ${isPopular ? 'border-2 border-blue-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
            Populer
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
        <p className="text-gray-500 mb-4">{plan.description}</p>
        
        <div className="mb-6">
          <span className="text-4xl font-bold">
            Rp {plan.price.toLocaleString('id-ID')}
          </span>
          <span className="text-gray-500">/{plan.duration} hari</span>
        </div>
        
        <ul className="text-left space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={() => onSelect?.(plan)}
          variant={isPopular ? 'primary' : 'outline'}
          className="w-full"
        >
          Pilih Paket
        </Button>
      </div>
    </Card>
  )
}
