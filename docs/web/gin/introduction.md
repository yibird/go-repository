Gin 是一个用 Go 实现的 Web 框架。它具有类似马提尼的 API，由于 httprouter，其性能提高了 40 倍。Gin 的主要特点如下:

- 零分配路由器:Gin 框架中的零分配路由器(Zero Allocation Router)是提高性能的一个重要优化点,主要通过以下几点实现:
  - 重用 context 对象 避免每次请求都创建新的 context,而是重用 request context。
  - 重用路由 路由注册后会保存到路由器,不需要每次请求都重新创建路由匹配。
  - 字符串重用 路径参数会存储在[]byte 中,避免字符串内存分配。
  - 优化参数处理 请求参数会绑定到指定对象或自己管理的内存区,避免分配内存。
  - 规避反射调用 尽可能使用非反射方式绑定参数,减少性能损耗。
  - 优化写响应 响应写操作会尽量重用缓冲区,减少分配。
  - 定长堆栈 使用定长的堆栈数组,重复利用空间,不重新分配。
- 快。Gin 之所以执行效率高,主要归功于以下几个方面:
  - 路由使用基于 Radix Tree(Radix 树也称为基数树或压缩前缀树，是一种用于高效存储和检索字符串的数据结构)的 httprouter,查找效率很高。
  - 缓存了所有注册的路由,无需每次请求都遍历匹配。
  - 重用了请求上下文 context 对象,避免重复分配内存。
  - 数据绑定直接使用指针,减少内存拷贝。
  - 模板渲染采用并发安全的渲染器,不会阻塞。
  - 中间件支持一组路由批量应用,无需逐个添加。
  - 最小化反射使用,关键路径上都避免反射。
  - 内存拷贝优化,响应使用可重用内存池。
  - 定长栈空间分配,复用内存,避免动态增长。
  - 协程异步处理,不会阻塞请求。
- 支持中间件。Gin 框架中的中间件(Middleware)实现了请求处理管道化的机制,多个中间件会按照顺序依次处理请求。Gin 中间件本质上一个匹配了某个条件的 Handler 函数,通过在该函数内自定义各种处理逻辑,实现功能扩展,例如 Logger(日志)、Recovery(恢复)、请求拦截、流量统计。
- 数据验证。Gin 可以灵活配合绑定验证、自定义函数、全局中间件等实现请求数据的验证。
- 路由组和错误管理。路由组是 Gin 组织路由的重要方式,使用合理的路由分组可以提高可维护性和扩展性,Gin 使用 RouterGroup()创建路由分组,也支持路由组上应用中间件,但中间件只会应用到该分组的路由上。Gin 支持默认错误处理(使用 NoRoute 函数)、自定义错误处理函数(实现 gin 提供的 Error 函数)、中间件捕获错误等多种方式处理路由匹配或者处理函数执行过程中的错误。
- 内置渲染。Gin 框架内置了以下几种渲染引擎:
  - JSON 渲染:可以直接返回 JSON 格式的数据。例如:`c.JSON(200, gin.H{"message": "ok"})`。
  - XML 渲染:用于返回 XML 格式的数据。例如:`c.XML()`。
  - YAML 渲染:用于返回 YAML 格式的数据。例如:`c.YAML()`。
  - ProtoBuf 渲染:用于返回经 Protobuf 序列化后的二进制数据。
  - MsgPack 渲染:用于返回 MessagePack 格式化后的数据。例如:`c.MsgPack()`。
  - String 渲染:用于输出字符串。例如:`c.String("Hello World")`。
  - 静态文件服务:用于返回静态文件。例如:`c.File()`。
  - 重定向:用于 URL 重定向。例如:`c.Redirect("www.baidu.com")`。

## 1.Gin 路由与路由组

### 1.1 创建第一个路由

安装 gin:

```shell
go get -u github.com/gin-gonic/gin
```

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	// 创建一个带有默认配置的Gin引擎实例
	r := gin.Default()
	/**
	 * r.GET()用于定义处理 HTTP GET 请求的路由的方法。gin提供了对应的POST、DELETE、
	 * PUT、PATCH等方法用于创建HTTP POST、DELETE、PUT、PATCH等请求。
	 * r.GET()接收路由路径、处理器函数两个参数,处理器函数接收一个 *gin.Context
	 * 对象作为参数，用于处理请求和生成响应
	 */
	r.GET("/", func(c *gin.Context) {
		// 通过上下文以JSON的形式响应数据
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello world!",
		})
	})
	/**
	 * r.Run()用于启动 Web 服务器的方法。Run()方法接受一个可选的参数 addr，
	 * 用于指定服务器要监听的网络地址和端口。如果不传入addr参数,则默认使用:8080
	 * 作为监听地址,即监听本地的 8080 端口。
	 * Run()方法会阻塞当前的 Goroutine,直到服务器停止或发生错误
	 */
	r.Run(":8080")
}
```

gin 提供的 api 如下:

- gin.NEW():创建并返回一个新的 Gin 引擎实例(Engine)。
- gin.Default():用于创建一个默认的 Gin 引擎实例。gin.Default()内部使用 gin.NEW()创建 Gin 引擎实例,并向 Gin 引擎实例注册了 Logger()和 Recovery()两个中间件,其中 Logger 中间件用于日志记录,Recovery 用于 recover panic 导致的程序崩溃。gin.Default()方法会 CACHE 第一个创建的引擎实例,如果重复调用时,会返回同一个实例,避免初始化多个 gin 引擎实例。另外,gin.Default()方法是协程安全的,可以并发调用,大部分情况下推荐 gin.Default()创建 Gin 账号密码校验
- gin.BasicAuth():gin 提供了一个认证中间件,主要用于在 Gin 框架中实现基本的 HTTP 基本认证。gin.BasicAuth()时需要提供账号密码校验函数。
- gin.Bind():用于将 HTTP 请求中的参数绑定到 Go 变量或结构体中。gin.Bind()支持绑定 JSON、form 表单、URL 查询参数等到结构体、map 等变量中,也支持请求验证、数据默认值、请求参数绑定到结构体等功能。
- gin.Dir():用于提供静态文件服务。
- gin.DisableBindValidation():一个设置全局配置的方法,作用是禁用请求参数绑定过程中的验证。
- gin.EnableJsonDecoderDisallowUnknownFields():是 Gin 框架中的一个配置选项，用于禁止 JSON 解码器在解码过程中忽略未知的字段。在默认情况下，Gin 使用 Go 标准库中的 JSON 解码器来解析传入的 JSON 数据。JSON 解码器在解码时允许 JSON 对象中包含额外的未知字段，并会忽略这些未知字段，而不会引发错误。
- gin.EnableJsonDecoderUseNumber():Gin 框架中的一个配置选项,用于启用 JSON 解码器将数字解析为 json.Number 类型。在默认情况下，Gin 使用 Go 标准库中的 JSON 解码器来解析传入的 JSON 数据。这意味着在解析 JSON 数字时，Go 标准库将其解析为 float64 类型。
- gin.Mode():Mode() 是 Gin 框架中的一个函数,用于返回一个字符串表示当前的运行模式。在 Gin 框架中，运行模式决定了应用程序的行为和配置加载方式。Gin 框架定义了三种运行模式：

  - gin.DebugMode：Debug 模式是 Gin 的默认运行模式。在 Debug 模式下，Gin 会提供更详细的错误信息和堆栈跟踪，以便开发者进行调试。此模式下，Gin 会自动重新加载模板文件和静态资源，并在每个请求中计算和显示请求的处理时间。
  - gin.ReleaseMode：Release 模式是用于生产环境的运行模式。在 Release 模式下，Gin 会关闭详细的错误信息和堆栈跟踪，并优化性能以提供更快的响应速度。此模式下，Gin 不会自动重新加载模板文件和静态资源，并且不会在每个请求中计算和显示请求的处理时间。
  - gin.TestMode：Test 模式是用于测试的运行模式。在 Test 模式下，Gin 会提供额外的功能来帮助进行单元测试。例如，Gin 会自动禁用中间件，以便更容易测试处理函数的行为。此模式下，Gin 会在 HTTP 响应中返回错误信息，以便于测试和断言。

- gin.Recovery():Gin 框架中的一个中间件函数,用于处理发生恐慌（panic）时的恢复和错误处理。
- gin.SetMode(value string):用于设置 Gin 的运行模式。
- gin.H: Gin 框架中的一个类型别名，表示一个键值对的映射，用于构建 HTTP 响应的数据。gin.H 类型实际上是 `map[string]interface{}` 的别名，它提供了一种简洁的方式来创建和操作键值对的映射。在 Gin 框架中，通常用于构建 JSON 响应数据。例如:`gin.H{"name": "zchengfeng"}`。

### 1.2 定义其它类型路由

## 2.Gin 获取请求参数

在 Gin 框架中，可以使用不同的方法来获取 HTTP 请求中的参数，包括查询参数(Query Parameters)、表单参数(Form Parameters)、路径参数(Path Parameters)和请求体参数(Request Body Parameters)等。

### 2.1 获取查询参数(Query Parameters)

gin.Content 对象提供 Query()、QueryMap()、QueryArray()三个方法用于获取 HTTP 请求的查询参数:

- Query():用于获取指定名称的查询参数的单个值。它接受一个字符串参数，表示要获取的查询参数的名称，并返回该参数的值。如果查询参数不存在，则返回一个空字符串
- QueryMap():用于获取所有的查询参数,并返回一个包含所有查询参数的键值对映射（map）。其中，查询参数的名称作为键，对应的值作为值
- QueryArray():用于获取指定名称的查询参数的所有值，并返回一个包含所有值的字符串切片（[]string）。

```go
func main() {
	r := gin.Default()
	/**
	 * Gin获取参数方式1:获取查询(Query)参数。IDEA HTTP Client测试
	 */
	r.GET("/queryParams", func(c *gin.Context) {
		name := c.Query("name")
		age, err := strconv.Atoi(c.Query("age"))
		if err != nil {
			fmt.Println("类型转换错误")
		}
		fmt.Printf("name:%s,age:%d\n", name, age) // name:zchengfeng,age:18
	})
}
```

IDEA HTTP Client 测试脚本:

```shell
GET localhost:8080/queryParams?name=zchengfeng&age=18
Accept: application/json
```

测试结果:

```text
name:zchengfeng,age:18
```

### 2.2 获取路径参数（Path Parameters）

在 Gin 框架中,可以通过定义带有路径参数的路由来获取路径参数（Path Parameters）。路径参数是指在路由路径中定义的动态部分，可以通过 c.Param()方法获取实际的参数值。

```go
// Gin获取参数方式2:获取路径参数(Path Parameters),
// 使用 :paramName 的形式定义路径中的参数占位符
r.GET("/pathParams/:id", func(c *gin.Context) {
  // c.Param("id")表示获取 /:id 路径实际的参数值
  id := c.Param("id")
  fmt.Println("id:", id) // id: s10001
})
```

IDEA HTTP Client 测试脚本:

```shell
GET localhost:8080/pathParams/s10001
Accept: application/json
```

### 2.3 获取表单参数(Form Parameters)

在 Gin 框架中,gin.Context 提供了 PostForm()、PostFormMap()和 PostFormArray()三个方法用于获取 HTTP 请求的表单参数:

- PostForm():用于获取指定名称的表单参数的单个值。它接受一个字符串参数，表示要获取的表单参数的名称，并返回该参数的值。如果表单参数不存在，则返回一个空字符串。
- PostFormMap():用于获取所有的表单参数，并返回一个包含所有表单参数的键值对映射（map）。其中，表单参数的名称作为键，对应的值作为值。
- PostFormArray():用于获取指定名称的表单参数的所有值，并返回一个包含所有值的字符串切片（[]string）。
- GetPostForm():用于获取指定名称的表单参数的单个值。如果 key 不存在,返回空字符串,如果有多个值,只返回第一个值。
- GetPostFormMap():用于获取所有的表单参数，并返回一个包含所有表单参数的键值对映射（map）。如果 key 不存在,map 中不会包含该 key,如果 key 存在多个值,只有第一个值在 map 中。
- GetPostFormArray():用于获取指定名称的表单参数的所有值，并返回一个包含所有值的字符串切片（[]string）。如果 key 不存在,返回空切片,如果 key 有多个值,可以全部获取到。

```go
// Gin获取参数方式3:获取表单参数(Form Parameters)
r.POST("/formParams", func(c *gin.Context) {
		name := c.PostForm("name")
		age, err := strconv.Atoi(c.PostForm("age"))
		if err != nil {
			fmt.Println("类型转换错误")
		}
		fmt.Printf("name:%s,age:%d\n", name, age) // name:zchengfeng,age:18
})
```

IDEA HTTP Client 测试脚本:

```shell
POST localhost:8080/formParams
Content-Type: application/x-www-form-urlencoded

name=zchengfeng&age=18
```

### 2.4 获取请求体参数（Request Body Parameters）:

在 Gin 框架中,gin.Context 提供多个以 ShouldBind 和 Bind 为前缀的方法用于绑定请求参数:

- `ShouldBind(obj any) error`:用于将请求参数绑定到指定的 Go 结构体的函数。它可以根据请求的内容类型（如 JSON、表单数据等）自动解析请求参数,并将其映射到指定的结构体上,支持参数验证和处理。
- `ShouldBindJSON(obj any) error`:用于将请求的 JSON 数据绑定到指定的 Go 结构体。它可以自动解析请求体中的 JSON 数据，并将其映射到指定的结构体上。
- `ShouldBindXML(obj any) error`:用于将请求的 XML 数据绑定到指定的 Go 结构体。它可以自动解析请求体中的 XML 数据，并将其映射到指定的结构体上。
- `ShouldBindYAML(obj any) error`:用于将请求的 YAML 格式的数据绑定到指定的 Go 结构体。它可以自动解析请求体中的 YAML 数据，并将其映射到指定的结构体上。
- `ShouldBindTOML(obj any) error`:用于将请求的 TOML 格式的数据绑定到指定的 Go 结构体。它可以自动解析请求体中的 TOML 数据，并将其映射到指定的结构体上。
- `ShouldBindUri(obj any) error`:用于将请求的 URI 路径参数绑定到指定的 Go 结构体。它可以自动解析请求的 URI 路径参数，并将其映射到指定的结构体上。
- `ShouldBindQuery(obj any) error`:。用于将请求的 URL 查询参数绑定到指定的 Go 结构体。它可以自动解析 URL 查询参数，并将其映射到指定的结构体上
- `ShouldBindHeader(obj any) error`:用于将请求的 Header 参数绑定到指定的 Go 结构体。它可以自动解析请求的 Header 参数，并将其映射到指定的结构体上。
- `ShouldBindWith(obj any, b binding.Binding) error`:用于将请求的消息绑定到指定的 Go 结构体，同时指定消息体的解析器。这个方法可以用于解析和绑定不同类型的请求体,Gin 支持 binding.JSON、binding.XML、binding.YAML、binding.Form 等解析器。例如使用 JSON 解析器解析参数:`c.ShouldBindBodyWith(&user, binding.JSON);`。
- `ShouldBindBodyWith(obj any, bb binding.BindingBody) (err error)`:与 ShouldBindWith()类似,用于将请求的请求体绑定到指定的 Go 结构体，同时指定消息体的解析器。

Gin 在解析请求参数绑定到结构体上,支持使用 tag 配置:

- json:用于指定字段在 JSON 数据中的名称。
- form:用于指定字段在表单数据中的名称。
- xml:用于指定字段在 XML 数据中的名称。
- yaml:用于指定字段在 YAML 数据中的名称。
- toml:用于指定字段在 TOML 数据中的名称。
- uri:用于指定字段在 URI 路径参数中的名称。
- query:用于指定字段在 URL 查询参数中的名称。
- header:用于指定字段在请求头中的名称。
- binding:用于指定字段的验证规则。binding 标签支持多个验证规则(以逗号分割):
  - required：指定字段为必填字段，不能为空。
  - min：指定字段的最小值或最小长度。
  - max：指定字段的最大值或最大长度。
  - email：指定字段为电子邮件格式。
  - url：指定字段为 URL 格式。
  - numeric：指定字段为数值类型。
  - alpha：指定字段只能包含字母。
  - alphanum：指定字段只能包含字母和数字。
  - len：指定字段的固定长度。

```go
type User struct {
	Name string `json:"name" form:"name" `
	Age  int    `json:"age" form:"age" `
}

r.POST("/jsonParams", func(c *gin.Context) {
	var user User
	// 用于将请求的 JSON 数据绑定到指定的 Go 结构体
	if err := c.ShouldBindJSON(&user); err == nil {
		fmt.Println(user) // {zchengfeng 18}
	} else {
		fmt.Println("参数解析错误")
	}
})
```

IDEA HTTP Client 测试脚本:

```shell
POST localhost:8080/jsonParams
Content-Type: application/json

{"name":"zchengfeng","age":18}
```

### 2.5 获取请求头参数和原始请求体数据

- GetHeader():用于从 HTTP 请求中获取指定的请求头信息。
- GetRawData():获取原始请求体数据,返回一个[]byte 切片和一个 err 对象。注意:使用 GetRawData()Gin 框架将不会自动解析请求体或将其绑定到结构体。

```go
r.POST("/requestParams", func(c *gin.Context) {
	// 根据请求头字段获取对应的值
	accessToken := c.GetHeader("access_token")
	fmt.Println("access_token:", accessToken) // access_token: qwer123456
	// 获取原始请求体数据,返回一个[]byte切片和一个err对象,
	// 使用GetRawData()Gin框架将不会自动解析请求体或将其绑定到结构体
	rawData, err := c.GetRawData()
	if err != nil {
		// 处理获取原始数据错误
		c.String(500, "Error: Failed to get raw data")
		return
	}
	// 将原始数据转换为字符串进行展示
	body := string(rawData)
	fmt.Println("Raw Data:", body) // Raw Data: { "name":"zchengfeng", "age":18 }
})
```

IDEA HTTP Client 测试脚本:

```shell
POST localhost:8080/requestParams
Content-Type: application/json
access_token: qwer123456

{ "name":"zchengfeng", "age":18 }
```

## 3.静态文件和模板渲染

## 4.中间件

在 Gin 框架中,中间件本质上是一个返回 gin.HandlerFunc 的函数,用于在请求处理过程中添加额外的逻辑或处理操作。Gin 中间件分为如下几种:

- 全局中间件(Global Middleware):全局中间件在所有路由请求之前都会执行，通常用于处理跨域请求、身份验证等通用逻辑。可以使用 gin.Default()或 gin.New()创建 Gin 引擎时默认注册的全局中间件。
- 路由中间件(Route Middleware):路由中间件仅适用于特定的路由或路由组，并在其范围内执行。可以使用 gin.RouterGroup 的 Use()方法将中间件注册到路由组中。
- 错误处理中间件(Error Handling Middleware):错误处理中间件用于捕获和处理路由处理函数中的错误。可以通过在路由处理函数中调用 c.Error(err)将错误传递给错误处理中间件。
- 自定义中间件(Custom Middleware):自定义中间件是根据特定需求编写的自定义逻辑，例如日志记录、性能监测、请求计数等。可以根据自己的需求编写并注册这些中间件。

此外，Gin 还提供了一些内置的中间件函数，例如 gin.Logger()用于记录请求日志，gin.Recovery()用于恢复从路由处理函数中发生的 panic。

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

// LoggerMiddleware 自定义日志中间件,自定义中间需要返回一个gin.HandlerFunc
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		fmt.Println("在处理请求之前...")
		// 调用下一个handler(处理程序)
		c.Next()
		fmt.Println("在处理请求之后...")
	}
}

func main() {
	r := gin.Default()

	// 全局注册中间件,该中间件将作用于所有请求
	r.Use(LoggerMiddleware())

	// 路由注册中间件,该中间件仅作用于对应路由组或路由
	r.GET("/hello", func(c *gin.Context) {
		fmt.Println("hello")
	}).Use(LoggerMiddleware())

	r.Run(":8080")
}
```

### 4.1 自定义认证中间件

### 4.2 自定义限流中间件

## 5.错误处理

在 Gin 框架中,通常使用中间件和错误处理函数来处理和返回错误。Gin 提供如下函数用于错误处理:

- c.Error(err error):将错误对象添加到当前请求的错误列表中。这通常在处理函数中用于抛出自定义错误。
- c.AbortWithError(code int, err error) \*gin.Error:中止请求处理并返回一个带有指定状态码和错误信息的错误对象。
- c.Errors:一个包含当前请求的错误列表的切片。可以使用 c.Errors.Last()获取最后一个错误。

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

// CustomError 自定义错误结构体
type CustomError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// 实现Gin的error接口方法
func (ce *CustomError) Error() string {
	return fmt.Sprintf("Custom Error: %s", ce.Message)
}

// ErrorHandler 错误处理中间件
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 放行请求,执行下一个handler
		c.Next()
		// 检查是否有错误发生
		if len(c.Errors) > 0 {
			// 获取最后一个错误
			lastError := c.Errors.Last()
			// 根据错误类型进行处理
			switch err := lastError.Err.(type) {
			case *CustomError:
				// 自定义错误类型的处理
				c.JSON(err.Code, gin.H{"error": err.Message, "code": err.Code})
				break
			default:
				// 其他错误类型的处理
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
			}
			// 终止请求
			c.Abort()
		}
	}
}

func main() {
	r := gin.Default()
	// 注册错误处理中间件,错误处理中间件应放置在所有路由注册之前,以确保它在处理路由之前起作用
	r.Use(ErrorHandler())

	// 访问http://localhost:8080/example 输出 { "code": 400, "error": "Bad Request" }
	r.GET("/example", func(c *gin.Context) {
		// 模拟出现错误
		err := &CustomError{
			Code:    http.StatusBadRequest,
			Message: "Bad Request",
		}
		// 手动抛出自定义错误
		c.Error(err)
	})
	r.Run(":8080")
}
```

## 6.参数校验

## 7.操作 Cookie & Session

### 7.1 Gin 操作 Cookie

在 Gin 框架中,gin.Context 对象提供 Cookie 和 setCookie 函数用于操作 Cookie:

- `Cookie(name string)`:根据 Cookie 的名称获取对应的 Cookie 值。
- `SetCookie(name, value string, maxAge int, path, domain string, secure, httpOnly bool)`:用于设置 Cookie,函数说明如下:
  - name(必填):Cookie 的名称。
  - value(必填):Cookie 的值。
  - maxAge:Cookie 的最大有效时间,以秒为单位,-1 表示被删除。优先级高于 Expires。
  - path:Cookie 可用的路径。默认值是"/"，表示可用于整个域名。
  - domain:Cookie 的域名。默认值是当前请求的域名。
  - secure:指定是否仅通过 HTTPS 传输 Cookie。默认值是 false，表示可以通过 HTTP 和 HTTPS 传输。
  - httpOnly:指定是否仅通过 HTTP 传输 Cookie，而不能通过 JavaScript 等脚本访问。默认值是 false。

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func main() {
	r := gin.Default()

	r.GET("setCookie", func(c *gin.Context) {
		// 设置Cookie
		c.SetCookie("username", "zchengfeng", 3600, "/", "localhost", false, true)
		c.String(http.StatusOK, "Cookie set")
	})

	r.GET("getCookie", func(c *gin.Context) {
		username, err := c.Cookie("username")
		if err != nil {
			c.String(http.StatusNotFound, "Cookie not found")
			return
		}
		c.String(http.StatusOK, "username: "+username)
	})

	r.GET("delCookie", func(c *gin.Context) {
		// 删除Cookie,使用SetCookie模拟删除Cookie,其value为空,maxAge为-1
		c.SetCookie("username", "", -1, "/", "localhost", false, true)
		c.String(http.StatusOK, "Cookie deleted")
	})
	r.Run(":8080")
}
```

### 7.2 Gin 操作 Session

Gin 本身不提供原生的 Session 功能,但可以使用第三方包(如 github.com/gin-contrib/sessions)来实现 Session 功能。

```shell
go get github.com/gin-contrib/sessions
```

```go
package main

import (
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	/**
	 * 使用cookie存储引擎来创建一个新的 Session 存储对象,该方法介绍一个字节数组,
	 * 字节数组被用作密钥来加密和验证存储在 cookie 中的 Session 数据
	 */
	store := cookie.NewStore([]byte("secret"))
	/*
	 * 注册Session插件,用于于处理 Session 相关的操作,Sessions函数接受name和store两个参数:
	 * - name:Session的名称,用于标识应用程序中的Session数据,通常是唯一的。
	 * - store:存储器。存储器是一个实现了 sessions.Store 接口的对象,用于实际的 Session 存储操作
	 */
	r.Use(sessions.Sessions("sessionName", store))

	r.GET("setSession", func(c *gin.Context) {
		// 获取当前请求关联的 Session 对象
		session := sessions.Default(c)
		// 设置Session
		session.Set("username", "zchengfeng")
		// 手动保存Session,在Gin中,Session 数据默认是在请求处理函数结束时自动保存
		session.Save()
	})

	r.GET("/getSession", func(c *gin.Context) {
		// 获取当前请求关联的 Session 对象
		session := sessions.Default(c)
		// 获取根据Session名称获取对应值,返回一个 interface{}
		username := session.Get("username")
		if username != nil {
			c.JSON(200, gin.H{"username": username})
		} else {
			c.JSON(200, gin.H{"message": "Session key not found"})
		}
	})

	r.GET("/delSession", func(c *gin.Context) {
		// 获取当前请求关联的 Session 对象
		session := sessions.Default(c)
		// 删除Session
		session.Delete("username")
	})

	r.GET("/clearSession", func(c *gin.Context) {
		// 获取当前请求关联的 Session 对象
		session := sessions.Default(c)
		// 清除session对象中所有数据
		session.Clear()
	})

	r.Run(":8080")
}
```

## 8.上传文件

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	r := gin.Default()
	// 设置文件上传的大小限制为 8MB
	r.MaxMultipartMemory = 8 << 20 // 8MB

	// 上传单个文件
	r.POST("/uploadFile", func(c *gin.Context) {
		// 获取表单中的文件
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		fmt.Println("文件名:", file.Filename)
		fmt.Println("文件大小(byte):", file.Size)
		fmt.Println("文件头:", file.Header)
		fmt.Println("文件类型:", file.Header.Get("Content-Type"))

		// 将文件保存到指定路径
		dst := "uploads/" + file.Filename
		// SaveUploadedFile()用于将上传的文件保存到指定的目标路径
		if err := c.SaveUploadedFile(file, dst); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
	})

	// 多文件上传
	r.POST("/uploadMultipleFiles", func(c *gin.Context) {
		// 获取表单中的多个文件
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// 遍历上传的文件
		files := form.File["files"]
		for _, file := range files {
			// 将每个文件保存到指定路径
			dst := "uploads/" + file.Filename
			if err := c.SaveUploadedFile(file, dst); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		c.JSON(http.StatusOK, gin.H{"message": "Files uploaded successfully"})
	})

	// 多文件并发上传
	r.POST("/concurrentUpload", func(c *gin.Context) {
		// 获取表单中的多个文件
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// 获取文件列表
		files := form.File["files"]
		// 创建一个channel来接收每个上传文件的结果
		results := make(chan string, len(files))
		// 启动协程处理每个上传文件
		for _, file := range files {
			go ProcessUpload(file, results)
		}
		// 等待所有协程完成
		for range files {
			fmt.Println(<-results)
		}
		c.JSON(http.StatusOK, gin.H{"message": "Files uploaded successfully"})
	})

	r.Run(":8080")
}

// ProcessUpload 处理文件上传
func ProcessUpload(file *multipart.FileHeader, results chan<- string) {
	// 打开文件
	src, err := file.Open()
	if err != nil {
		results <- fmt.Sprintf("Failed to open file %s: %s", file.Filename, err.Error())
		return
	}
	// 函数执行完毕时关闭文件
	defer src.Close()

	// 创建目录
	if err := os.MkdirAll("uploads", 0755); err != nil {
		fmt.Sprintf("Failed to create dir:%s", err.Error())
		return
	}

	// 构建目标文件路径
	dst := filepath.Join("uploads", file.Filename)
	fmt.Println("dst:", dst)
	// 创建目标文件
	dstFile, err := os.Create(dst)
	if err != nil {
		results <- fmt.Sprintf("Failed to create file %s: %s", file.Filename, err.Error())
		return
	}
	defer dstFile.Close()
	// 将源文件内容拷贝到目标文件
	_, err = io.Copy(dstFile, src)
	if err != nil {
		results <- fmt.Sprintf("Failed to copy file %s: %s", file.Filename, err.Error())
		return
	}
	results <- fmt.Sprintf("File %s uploaded successfully", file.Filename)
}
```

## 9.Gin 整合 Swag

## 10.Gin 集成 WebSocket

## 11.Gin 集成 SSE

SSE （Server-Sent Events）是一种基于 HTTP 的单向通信机制，用于实现服务器向客户端推送数据的能力,相比较 WebSocket 更加轻量级,由于小程序、APP 环境并不支持 SSE,因此 SSE 适用于 PC 端的消息推送等场景。为了确保 SSE 正确工作，需要设置特定的响应头信息:

- Content-Type:text/event-stream:text/event-stream 表示服务器返回的是 SSE 格式的数据流。客户端接收到这个头信息后，知道这是一个 SSE 连接，并能正确地处理和解析响应数据。
- `Cache-Control:no-cache`:no-cache 表示禁用 HTTP 缓存。SSE 是实时推送数据的机制，不适合进行缓存，因此需要禁用缓存。
- `Connection:keep-alive`:表示服务器和客户端之间的连接保持活跃状态。SSE 是长连接机制，需要保持连接以便服务器能够持续地向客户端推送数据。
- `Access-Control-Allow-Origin:*`:这个头信息表示允许所有来源的客户端访问 SSE 服务，即允许跨域请求。在开发阶段或无需限制访问来源时，可以设置为 `"*"`,表示允许任何来源的客户端访问。

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"time"
)

func main() {
	r := gin.Default()
	r.GET("/sse", func(c *gin.Context) {
		c.Header("Content-Type", "text/event-stream")
		c.Header("Cache-Control", "no-cache")
		c.Header("Connection", "keep-alive")
		c.Header("Access-Control-Allow-Origin", "*")

		// 创建一个定时器,每隔 1 秒触发一次
		ticker := time.NewTicker(1 * time.Second)
		// 请求结束时关闭定时器
		defer ticker.Stop()

		for {
			select {
			// 使用通道选择语句来监听客户端连接关闭的事件
			case <-c.Writer.CloseNotify():
				// 客户端连接关闭时退出循环
				return
			// 等待定时器触发
			case <-ticker.C:
				// 每秒向客户端发送一个消息
				data := fmt.Sprintf("Message sent at: %s", time.Now().Format("2006-01-02 15:04:05"))
				message := fmt.Sprintf("data: %s\n\n", data)
				// 将字符串写入响应流的方法
				c.Writer.WriteString(message)
				// 将响应缓冲区中的数据刷新并立即发送给客户端的方法
				c.Writer.Flush()
			}
		}
	})
	r.Run(":8080")
}
```

## 11.HTTP2 server 推送

## Gin 项目的优化策略

### 使用 Jsoniter 作为 JSON 包

Gin 使用 encoding/json 作为默认的 json 包,Jsoniter 是一个针对高性能 JSON 编解码的库，相比于 Gin 默认使用的 Go 标准库中的 encoding/json 包，Jsoniter 具有以下优势：

- 更快的解码和编码速度：Jsoniter 通过优化的算法和数据结构，以及直接使用底层的字节操作，实现了更快的 JSON 解码和编码速度。它在解析和生成大型复杂 JSON 数据时，通常比标准库更快。
- 更低的内存消耗：Jsoniter 在解码 JSON 数据时，避免了额外的内存分配和拷贝操作，从而减少了内存消耗。这对于大型 JSON 数据或高并发场景下的内存优化非常有帮助。
- 更好的兼容性：Jsoniter 提供了与标准库 encoding/json 类似的 API，可以无缝替换标准库的使用，而不需要对现有代码进行太多改动。它与标准库的兼容性使得迁移和使用变得更加容易。
- 支持更多的特性：Jsoniter 在功能上也提供了一些标准库没有的附加特性，例如对注解的支持、自定义编码器和解码器、更好的错误处理等。这些特性可以提供更大的灵活性和更好的开发体验。
