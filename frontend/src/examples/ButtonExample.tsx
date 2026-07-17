import { useState } from 'react'
import { Button } from '../components/Button'

export function ButtonExample() {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const handleSubmit = () => {
    alert('Execute button clicked!')
  }

  return (
    <div className="w-full space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Button Variants</h2>
        
        {/* Default Variant */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Default</h3>
          <div className="flex gap-2 flex-wrap">
            <Button>Default Button</Button>
            <Button disabled>Disabled</Button>
            <Button isLoading>Loading...</Button>
          </div>
        </div>

        {/* Primary Action */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Primary Action</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSubmit}>Execute Script</Button>
            <Button onClick={handleClick} isLoading={isLoading}>
              {isLoading ? 'Processing...' : 'Run Test'}
            </Button>
          </div>
        </div>

        {/* Outline Variant */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Outline</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">Outline Button</Button>
            <Button variant="outline" disabled>Disabled</Button>
          </div>
        </div>

        {/* Secondary Variant */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Secondary</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="secondary">Secondary</Button>
            <Button variant="secondary" disabled>Disabled</Button>
          </div>
        </div>

        {/* Ghost Variant */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Ghost</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="ghost">Ghost</Button>
            <Button variant="ghost" disabled>Disabled</Button>
          </div>
        </div>

        {/* Destructive Variant */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Destructive</h3>
          <div className="flex gap-2 flex-wrap">
            <Button variant="destructive">Delete</Button>
            <Button variant="destructive" disabled>Disabled</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Sizes</h3>
          <div className="flex gap-2 flex-wrap items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </div>

        {/* With Icon */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">With Icon</h3>
          <div className="flex gap-2 flex-wrap">
            <Button icon="📝">Edit</Button>
            <Button icon="💾">Save</Button>
            <Button icon="🔄">Refresh</Button>
            <Button variant="destructive" icon="🗑️">Remove</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ButtonExample
