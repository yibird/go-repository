## 1.Go 语言简介

Go(又称 Golang)是 Google 的 Robert Griesemer(Unix 操作系统的发明人之一,B 语言的设计者,UTF-8 编码设计者之一,图灵奖得主)、Rob Pike(参与贝尔实验室 Unix 的开发,设计了 UTF8) 、Ken Thompson(C 语言前身 B 语言的作者,Unix 的发明人之一)于 2007 开发的一种静态强类型、编译型语言。Go 语言语法与 C 相近,但功能上有支持内存安全、GC(垃圾回收),结构形态及 CSP-style 并发计算。Go 语言具有如下优点

- 简洁易读:Go 语言具有简洁的语法和清晰的代码结构,使代码易于阅读、理解和维护。它强调代码的可读性,有助于提高开发效率和团队协作。
- 并发支持:Go 语言天生支持并发编程,通过 goroutine 和 channel 提供简单而强大的并发模型。这使得编写并发代码变得容易,可以充分利用多核处理器的优势。
- 内置 runtime,支持垃圾回收:Go 语言在性能方面表现出色,具有较低的内存占用和快速的启动时间。它的垃圾回收机制和编译器优化使其在处理大规模并发和高负载的场景下表现出色。
- 丰富的标准库:Go 语言提供了丰富的标准库和工具,涵盖了各种领域,包括网络编程、并发编程、加密、测试等。这些工具和库的存在减少了对第三方库的依赖,简化了开发过程。
- 静态类型和编译型:Go 语言是静态类型的编程语言,编译时会进行类型检查,减少了潜在的类型错误。同时,Go 语言的编译速度非常快,可以快速构建和部署应用程序。
- 跨平台:Go 语言支持跨多个操作系统和硬件架构进行开发和部署。编译后的可执行文件可以在不同的平台上运行,使得应用程序的移植和交付更加灵活和方便。

Go 适用于各种应用场景,从小型工具到大规模分布式系统都能发挥出色的效果。得益于 Go 语言在性能、并发性、快速开发、跨平台支持、可靠性和丰富的生态系统方面的优点,使其成为构建云原生应用的理想选择。它能够满足云原生应用对高性能、可伸缩性和稳定性的需求,并能够快速适应不同的云环境和容器化平台。

Go 语言拥有一个活跃且丰富的生态系统,其中知名的项目包括:

- Docker:Docker 是一款基于 go 语言实现的容器引擎。
- Kubernetes:Kubernetes 是一款基于 go 语言实现的用于管理云平台中多个主机上的容器化的应用。
- Consul:Consul 是一个的支持多数据中心分布式高可用的服务发现和配置共享的服务软件,由 HashiCorp 公司用 Go 语言开发, 基于 Mozilla Public License 2.0 的协议进行开源. Consul 支持健康检查,并允许 HTTP 和 DNS 协议调用 API 存储键值对。
- ETCD:ETCD 是用于共享配置和服务发现的分布式,一致性的 KV 存储系统。

## 2.编写 Go 应用

### 2.1 搭建 Go 环境

下载 Go 安装包完成安装后,需要配置 GOPATH 环境变量,用于表示 Go 项目的存放路径。GOPATH 目录下有 bin、pkg、src 三个目录(若没有则新建),bin 目录用于存放编译后生成的可执行文件,pkg 目录用于存放编译后生成的归档文件,src 用于存放源码文件。Go 常用命令如下:

```shell
$ go
Go is a tool for managing Go source code.

Usage:

    go command [arguments]

The commands are:

    build       compile packages and dependencies
    clean       remove object files
    doc         show documentation for package or symbol
    env         print Go environment information
    bug         start a bug report
    fix         run go tool fix on packages
    fmt         run gofmt on package sources
    generate    generate Go files by processing source
    get         download and install packages and dependencies
    install     compile and install packages and dependencies
    list        list packages
    run         compile and run Go program
    test        test packages
    tool        run specified go tool
    version     print Go version
    vet         run go tool vet on packages

Use "go help [command]" for more information about a command.

Additional help topics:

    c           calling between Go and C
    buildmode   description of build modes
    filetype    file types
    gopath      GOPATH environment variable
    environment environment variables
    importpath  import path syntax
    packages    description of package lists
    testflag    description of testing flags
    testfunc    description of testing functions

Use "go help [topic]" for more information about that topic.
```

- go env 用于打印 Go 语言的环境信息。
- go run 命令可以编译并运行命令源码文件。
- go get 可以根据要求和实际情况从互联网上下载或更新指定的代码包及其依赖包,并对它们进行编译和安装。
- go build 命令用于编译我们指定的源码文件或代码包以及它们的依赖包。
- go install 用于编译并安装指定的代码包及它们的依赖包。
- go clean 命令会删除掉执行其它命令时产生的一些文件和目录。
- go doc 命令可以打印附于 Go 语言程序实体上的文档。我们可以通过把程序实体的标识符作为该命令的参数来达到查看其文档的目的。
- go test 命令用于对 Go 语言编写的程序进行测试。
- go list 命令的作用是列出指定的代码包的信息。
- go fix 会把指定代码包的所有 Go 语言源码文件中的旧版本代码修正为新版本的代码。
- go vet 是一个用于检查 Go 语言源码中静态错误的简单工具。
- go tool pprof 命令来交互式的访问概要文件的内容。

### 2.2 编写第一个 Go 应用

```go
// 新建一个one.go文件

package main // 声明 main 包,表明当前是一个可执行程序,一定要声明main包否则将程序运行不了
import "fmt" // 导入go内部fmt模块

// 声明main函数,main函数为程序入口函数
func main(){
	fmt.Print("hello golang") // 在终端打印"hello golang"
}

// 可以直接通过golang idea 直接运行,也可以通过 go build命令编译go文件的得到可执行文件
```

打开终端进入 one.go 所在文件目录,执行 go build one.go 就可以编译 go 文件并生成一个可执行文件。

```c
// 执行go build one.go命令会在当前文件下生成一个可执行文件,如果是windows系统则会生成one.exe,双击one.exe即可执行。也可以通过-o 选项指定编译后可生成文件的名字,例如:go build -o haha.exe
C:\learn\go\go-base\go-base-example01\one>go build one.go

C:\learn\go\go-base\go-base-example01\one>one.exe
hello golang
```

### 2.3 Go 内置函数和内置接口

在 Go 语言中,内置了许多常用的函数和方法,用于处理字符串、数学运算、类型转换等常见操作。以下是 Go 语言的一些常用内置函数:

- len:用于返回字符串、数组、切片、映射和通道等类型的长度或元素个数。
- cap:用于返回切片、数组和通道的容量。
- make:用于创建切片、映射和通道。
- append:用于向切片追加元素。
- delete:从 map 中删除 key 对应的 value。
- copy:用于复制切片或数组的内容到目标切片或数组。
- close:用于关闭通道,通知接收者不会再有数据发送。
- panic:用于引发运行时异常。
- recover:用于从 panic 中恢复并返回 panic 值。
- print 和 println:用于打印输出,已被 fmt 包中的函数取代。

Go 语言中有一些内置的接口(interfaces),这些接口定义了一组方法的契约,用于实现特定的行为。以下是 Go 语言中一些常用的内置接口:

- 空接口(empty interface):空接口 interface{}不包含任何方法,可以表示任意类型的值。它类似于其他编程语言中的"任意类型"或"泛型"的概念。
- Stringer 接口:Stringer 接口定义了 String()方法,用于返回对象的字符串表示形式。通过实现 Stringer 接口,可以自定义对象的字符串表示,方便调试和打印输出。
- Error 接口:error 接口是一个内置接口,定义了一个用于表示错误的方法 Error(),返回错误的字符串描述。通过实现 error 接口,可以自定义错误类型,并将其作为返回值来表示错误。
- Reader 和 Writer 接口:io 包中定义了 Reader 和 Writer 接口,用于进行输入和输出操作。Reader 接口定义了 Read()方法用于读取数据,Writer 接口定义了 Write()方法用于写入数据。
- Closer 接口:io 包中的 Closer 接口定义了 Close()方法,用于关闭资源。实现了 Closer 接口的类型可以进行资源的释放操作,如文件的关闭等。
- Sort 接口:sort 包中定义了 Sort 接口,用于对切片进行排序。实现了 Sort 接口的类型可以使用 sort 包中的函数进行排序操作。
- Marshaler 和 Unmarshaler 接口:encoding/json 和 encoding/xml 等包中定义了 Marshaler 和 Unmarshaler 接口,用于进行对象的序列化和反序列化。

除了上述内置接口外,Go 语言还提供了许多其他的接口,如 ReaderAt、WriterAt、Seeker 等,用于特定的输入输出和操作。这些内置接口为 Go 语言的库和框架提供了一致的接口契约,使得代码更加模块化、可扩展和灵活。同时,通过接口的使用,也使得代码更易于测试和重用。

### 2.4 Go 语言命名规范

Go 语言从语法层面进行了以下限定:任何需要对外暴露的名字必须以大写字母开头,不需要对外暴露的则应该以小写字母开头。

- 当命名(包括常量、变量、类型、函数名、结构字段等等)以一个大写字母开头,表示可以被外部包的代码所使用。等同于其他语言中的 public 修饰符。
- 命名如果以小写字母开头,则对包外是不可见的,但是他们在整个包的内部是可见并且可用的。等同于其他语言的 private 修饰符。
- 包名称:Go 语言中的包名称一般以小写单词,不要使用下划线或者混合大小写。
- 文件命名:Go 语言中的文件命名应尽量采取有意义的文件名,简短,有意义,应该为小写单词,使用下划线分隔各个单词。
- 结构体命名:Go 语言中的结构体命名采用驼峰命名法,首字母根据访问控制大写或者小写。
- 接口命名:Go 语言中的接口命名与结构体命名是一致的,单个函数的结构名以 "er"作为后缀,例如 Reader、Writer。
- 变量命名:Go 语言中的变量命名规则和结构体命名规则一致,变量名称一般遵循驼峰法,首字母根据访问控制原则大写或者小写,但遇到特有名词时,需要遵循以下规则:
  - 如果变量为私有,且特有名词为首个单词,则使用小写,如 appService。
  - 若变量类型为 bool 类型,则名称应以 Has, Is, Can 或 Allow 开头。
- 常量命名:Go 语言中的常量均需使用全部大写字母组成,并使用下划线分词。如果是枚举类型的常量,需要先创建相应类型。

```go
// ------------------------------ 文件命名
model  // 正确的
Model // 错误的
service // 正确的
service_user // 错误的

// ------------------------------ 常量枚举命名
// 普通常量
const APP_NAME = "xxxApp" // 好的
const APPNAME = "xxxApp" // 坏的
const appName = "xxxApp" // 坏的

// 枚举常量
type Scheme = string
const (
	HTTP  Scheme = "http"
	HTTPS Scheme = "https"
)
```
