import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext(null)

export function Select({ children, onValueChange, defaultValue, value }) {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || value || "")
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedLabel, setSelectedLabel] = React.useState("")

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  const handleValueChange = React.useCallback((val, label) => {
    setSelectedValue(val)
    setSelectedLabel(label)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(val)
    }
  }, [onValueChange])

  return (
    <SelectContext.Provider value={{ selectedValue, handleValueChange, isOpen, setIsOpen, selectedLabel, setSelectedLabel }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext)
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }) {
  const { selectedLabel, selectedValue } = React.useContext(SelectContext)
  return (
    <span className="block truncate text-slate-900 text-left">
      {selectedLabel || selectedValue || placeholder}
    </span>
  )
}

export function SelectContent({ children, className }) {
  const { isOpen } = React.useContext(SelectContext)
  if (!isOpen) return null
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-950 shadow-md",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SelectItem({ value, children, className }) {
  const { selectedValue, handleValueChange, setSelectedLabel } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  React.useEffect(() => {
    if (isSelected) {
      setSelectedLabel(children)
    }
  }, [isSelected, children, setSelectedLabel])

  return (
    <div
      onClick={() => handleValueChange(value, children)}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-slate-100 hover:text-slate-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-slate-100 text-slate-900 font-semibold",
        className
      )}
    >
      {children}
    </div>
  )
}
