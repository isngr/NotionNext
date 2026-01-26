import { render, screen, waitFor } from '@testing-library/react'
import LazyImage from '@/components/LazyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver

describe('懒加载图片组件', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image'
  }

  beforeEach(() => {
    mockIntersectionObserver.mockClear()
  })

  it('使用必需属性正确渲染', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('alt', 'Test image')
  })

  it('应用自定义 className', () => {
    const customClass = 'custom-image-class'
    render(<LazyImage {...defaultProps} className={customClass} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveClass(customClass)
  })

  it('设置 width 和 height 属性', () => {
    render(
      <LazyImage 
        {...defaultProps} 
        width={300} 
        height={200} 
      />
    )
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('width', '300')
    expect(image).toHaveAttribute('height', '200')
  })

  it('处理优先加载（priority）', () => {
    render(<LazyImage {...defaultProps} priority />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('loading', 'eager')
  })

  it('默认使用懒加载', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it('处理点击事件', () => {
    const handleClick = jest.fn()
    render(<LazyImage {...defaultProps} onClick={handleClick} />)
    
    const image = screen.getByAltText('Test image')
    image.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('非优先加载时设置 IntersectionObserver', () => {
    render(<LazyImage {...defaultProps} />)
    
    expect(mockIntersectionObserver).toHaveBeenCalled()
  })

  it('优先加载图片不设置 IntersectionObserver', () => {
    render(<LazyImage {...defaultProps} priority />)
    
    // 优先加载图片应立即加载，不使用 IntersectionObserver
    expect(mockIntersectionObserver).not.toHaveBeenCalled()
  })

  it('处理 load 事件', async () => {
    const handleLoad = jest.fn()
    render(<LazyImage {...defaultProps} onLoad={handleLoad} />)
    
    const image = screen.getByAltText('Test image')
    
    // 模拟图片加载完成
    Object.defineProperty(image, 'complete', { value: true })
    image.dispatchEvent(new Event('load'))
    
    await waitFor(() => {
      expect(handleLoad).toHaveBeenCalled()
    })
  })

  it('优雅处理加载错误', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    
    // 模拟图片加载错误
    image.dispatchEvent(new Event('error'))
    
    // 组件仍应存在于文档中
    expect(image).toBeInTheDocument()
  })

  it('应用正确的 decoding 属性', () => {
    render(<LazyImage {...defaultProps} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveAttribute('decoding', 'async')
  })

  it('优雅处理缺少 src 的情况', () => {
    render(<LazyImage alt="Test image" />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toBeInTheDocument()
  })

  it('应用自定义样式', () => {
    const customStyle = { border: '1px solid red' }
    render(<LazyImage {...defaultProps} style={customStyle} />)
    
    const image = screen.getByAltText('Test image')
    expect(image).toHaveStyle('border: 1px solid red')
  })
})
