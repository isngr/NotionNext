import { Validator, Sanitizer, RateLimiter } from '@/lib/utils/validation'

describe('验证器', () => {
  describe('isValidEmail', () => {
    it('验证正确的电子邮件地址', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ]

      validEmails.forEach(email => {
        expect(Validator.isValidEmail(email)).toBe(true)
      })
    })

    it('拒绝无效的电子邮件地址', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        '',
        null,
        undefined
      ]

      invalidEmails.forEach(email => {
        expect(Validator.isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('isValidUrl', () => {
    it('验证正确的 URL', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org',
        'https://sub.domain.com/path?query=value',
        'http://localhost:3000'
      ]

      validUrls.forEach(url => {
        expect(Validator.isValidUrl(url)).toBe(true)
      })
    })

    it('拒绝无效的 URL', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com',
        'javascript:alert(1)',
        '',
        null,
        undefined
      ]

      invalidUrls.forEach(url => {
        expect(Validator.isValidUrl(url)).toBe(false)
      })
    })
  })

  describe('isValidSlug', () => {
    it('验证正确的 slug', () => {
      const validSlugs = [
        'hello-world',
        'test-post-123',
        'simple',
        'multi-word-slug'
      ]

      validSlugs.forEach(slug => {
        expect(Validator.isValidSlug(slug)).toBe(true)
      })
    })

    it('拒绝无效的 slug', () => {
      const invalidSlugs = [
        'Hello World',
        'test_post',
        'slug with spaces',
        'UPPERCASE',
        '',
        null,
        undefined
      ]

      invalidSlugs.forEach(slug => {
        expect(Validator.isValidSlug(slug)).toBe(false)
      })
    })
  })

  describe('isValidNotionId', () => {
    it('验证正确的 Notion ID', () => {
      const validIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567e89b12d3a456426614174000',
        'abcdef12-3456-7890-abcd-ef1234567890'
      ]

      validIds.forEach(id => {
        expect(Validator.isValidNotionId(id)).toBe(true)
      })
    })

    it('拒绝无效的 Notion ID', () => {
      const invalidIds = [
        'not-a-uuid',
        '123-456-789',
        '',
        null,
        undefined
      ]

      invalidIds.forEach(id => {
        expect(Validator.isValidNotionId(id)).toBe(false)
      })
    })
  })

  describe('isValidLength', () => {
    it('正确验证字符串长度', () => {
      expect(Validator.isValidLength('hello', 1, 10)).toBe(true)
      expect(Validator.isValidLength('test', 4, 4)).toBe(true)
      expect(Validator.isValidLength('', 0, 5)).toBe(true)
    })

    it('拒绝超出长度范围的字符串', () => {
      expect(Validator.isValidLength('hello', 10, 20)).toBe(false)
      expect(Validator.isValidLength('very long string', 1, 5)).toBe(false)
      expect(Validator.isValidLength('test', 5, 10)).toBe(false)
    })
  })

  describe('isValidNumber', () => {
    it('验证范围内的数字', () => {
      expect(Validator.isValidNumber(5, 1, 10)).toBe(true)
      expect(Validator.isValidNumber(0, 0, 0)).toBe(true)
      expect(Validator.isValidNumber(-5, -10, 0)).toBe(true)
    })

    it('拒绝范围外的数字', () => {
      expect(Validator.isValidNumber(15, 1, 10)).toBe(false)
      expect(Validator.isValidNumber(-5, 0, 10)).toBe(false)
      expect(Validator.isValidNumber(NaN, 1, 10)).toBe(false)
    })
  })
})

describe('净化器', () => {
  describe('stripHtml', () => {
    it('移除 HTML 标签', () => {
      expect(Sanitizer.stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world')
      expect(Sanitizer.stripHtml('<script>alert(1)</script>')).toBe('alert(1)')
      expect(Sanitizer.stripHtml('No HTML here')).toBe('No HTML here')
    })

    it('处理空输入或 null 输入', () => {
      expect(Sanitizer.stripHtml('')).toBe('')
      expect(Sanitizer.stripHtml(null)).toBe('')
      expect(Sanitizer.stripHtml(undefined)).toBe('')
    })
  })

  describe('sanitizeXss', () => {
    it('移除 XSS 模式', () => {
      expect(Sanitizer.sanitizeXss('<script>alert(1)</script>')).toBe('')
      expect(Sanitizer.sanitizeXss('<iframe src="evil.com"></iframe>')).toBe('')
      expect(Sanitizer.sanitizeXss('javascript:alert(1)')).toBe('')
    })

    it('保留安全内容', () => {
      expect(Sanitizer.sanitizeXss('Hello world')).toBe('Hello world')
      expect(Sanitizer.sanitizeXss('Safe text content')).toBe('Safe text content')
    })
  })

  describe('sanitizeFilename', () => {
    it('移除非法字符', () => {
      expect(Sanitizer.sanitizeFilename('file<name>.txt')).toBe('filename.txt')
      expect(Sanitizer.sanitizeFilename('file|name?.txt')).toBe('filename.txt')
    })

    it('将空格替换为下划线', () => {
      expect(Sanitizer.sanitizeFilename('my file name.txt')).toBe('my_file_name.txt')
    })

    it('移除首尾的点号', () => {
      expect(Sanitizer.sanitizeFilename('...filename...')).toBe('filename')
    })
  })

  describe('escapeHtml', () => {
    it('转义 HTML 实体', () => {
      expect(Sanitizer.escapeHtml('<script>')).toBe('&lt;script&gt;')
      expect(Sanitizer.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
      expect(Sanitizer.escapeHtml('"Hello"')).toBe('&quot;Hello&quot;')
    })
  })
})

describe('速率限制器', () => {
  let rateLimiter

  beforeEach(() => {
    rateLimiter = new RateLimiter()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('允许在限制范围内的请求', () => {
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(false)
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(false)
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(false)
  })

  it('阻止超出限制的请求', () => {
    // 发出 5 次请求（达到限制）
    for (let i = 0; i < 5; i++) {
      expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(false)
    }
    
    // 第 6 次请求应被阻止
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(true)
  })

  it('在时间窗口结束后重置', () => {
    // 发出 5 次请求
    for (let i = 0; i < 5; i++) {
      rateLimiter.isRateLimited('user1', 5, 60000)
    }
    
    // 应被阻止
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(true)
    
    // 推进时间超过窗口
    jest.advanceTimersByTime(61000)
    
    // 应再次允许
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(false)
  })

  it('为不同用户分别处理', () => {
    // 用户1 发出 5 次请求
    for (let i = 0; i < 5; i++) {
      rateLimiter.isRateLimited('user1', 5, 60000)
    }
    
    // 用户1 应被阻止
    expect(rateLimiter.isRateLimited('user1', 5, 60000)).toBe(true)
    
    // 用户2 仍应被允许
    expect(rateLimiter.isRateLimited('user2', 5, 60000)).toBe(false)
  })
})
