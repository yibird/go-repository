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

### 2.5 获取请求头参数和原始请求体数据

## 3.静态文件和模板渲染

## 4.中间件

## 5.错误处理

## 6.参数校验

## 7.Cookie & Session

## 8.上传文件

## 9.Gin 整合 Swag
