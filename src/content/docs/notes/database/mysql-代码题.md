---
title: mysql 代码题
---

## 高频题

建表 sql 和各个表对应的数据：

```sql
DROP TABLE IF EXISTS score;
DROP TABLE IF EXISTS login_record;
DROP TABLE IF EXISTS daily_sales;
DROP TABLE IF EXISTS user_account;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS student;

-- 学生表
CREATE TABLE student (
    id INT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    class_name VARCHAR(20),
    age INT
);

INSERT INTO student VALUES
(1,  '张三', '男', '一班', 18),
(2,  '李四', '男', '一班', 19),
(3,  '王五', '男', '一班', 18),
(4,  '赵六', '女', '一班', 20),
(5,  '孙七', '女', '二班', 18),
(6,  '周八', '男', '二班', 19),
(7,  '吴九', '女', '二班', 20),
(8,  '郑十', '男', '二班', 18),
(9,  '钱一', '女', '三班', 19),
(10, '陈二', '男', '三班', 18);


-- 课程表
CREATE TABLE course (
    id INT PRIMARY KEY,
    course_name VARCHAR(50) NOT NULL
);

INSERT INTO course VALUES
(101, '语文'),
(102, '数学'),
(103, '英语'),
(104, '物理');


-- 成绩表
CREATE TABLE score (
    id INT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    score INT NOT NULL,

    FOREIGN KEY (student_id) REFERENCES student(id),
    FOREIGN KEY (course_id) REFERENCES course(id),

    UNIQUE (student_id, course_id)
);

INSERT INTO score VALUES
-- 语文
(1,  1, 101, 90),
(2,  2, 101, 91),
(3,  3, 101, 91),
(4,  4, 101, 85),
(5,  5, 101, 78),
(6,  6, 101, 60),
(7,  7, 101, 59),
(8,  8, 101, 88),
(9,  9, 101, 82),
-- 数学
(10, 1, 102, 80),
(11, 2, 102, 77),
(12, 3, 102, 95),
(13, 4, 102, 95),
(14, 5, 102, 66),
(15, 6, 102, 60),
(16, 7, 102, 88),
(17, 8, 102, 72),
-- 英语
(18, 1, 103, 90),
(19, 2, 103, 60),
(20, 3, 103, 76),
(21, 4, 103, 88),
(22, 5, 103, 88),
(23, 6, 103, 59),
(24, 7, 103, 92),
(25, 8, 103, 70);


-- 重复用户表
CREATE TABLE user_account (
    id INT PRIMARY KEY,
    username VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20)
);

INSERT INTO user_account VALUES
(1, 'zhangsan', 'zhangsan@test.com', '13800000001'),
(2, 'lisi',     'lisi@test.com',     '13800000002'),
(3, 'wangwu',   'wangwu@test.com',   '13800000003'),

-- username 重复
(4, 'zhangsan', 'zhangsan2@test.com','13800000004'),

-- email 重复
(5, 'sunqi',    'lisi@test.com',     '13800000005'),

-- phone 重复
(6, 'zhouba',   'zhouba@test.com',   '13800000003'),

-- username 再次重复
(7, 'zhangsan', 'zhangsan3@test.com','13800000007'),

(8, 'wujiu',    'wujiu@test.com',    '13800000008');


-- 登录记录表
CREATE TABLE login_record (
    id INT PRIMARY KEY,
    user_id INT NOT NULL,
    login_date DATE NOT NULL
);

INSERT INTO login_record VALUES
-- 用户1：连续登录 4 天
(1, 1, '2026-09-01'),
(2, 1, '2026-09-02'),
(3, 1, '2026-09-03'),
(4, 1, '2026-09-04'),
(5, 1, '2026-09-08'),
-- 用户2：3~5号连续登录3天
(6, 2, '2026-09-01'),
(7, 2, '2026-09-03'),
(8, 2, '2026-09-04'),
(9, 2, '2026-09-05'),
-- 用户3：完全不连续
(10, 3, '2026-09-01'),
(11, 3, '2026-09-05'),
(12, 3, '2026-09-09'),
-- 用户4：连续2天
(13, 4, '2026-09-10'),
(14, 4, '2026-09-11'),
-- 用户5：连续4天
(15, 5, '2026-09-07'),
(16, 5, '2026-09-08'),
(17, 5, '2026-09-09'),
(18, 5, '2026-09-10');


-- 每日销售额
CREATE TABLE daily_sales (
    id INT PRIMARY KEY,
    sale_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
);

INSERT INTO daily_sales VALUES
(1,  '2026-09-01', 100),
(2,  '2026-09-02', 120),
(3,  '2026-09-03', 110),
(4,  '2026-09-04', 150),
(5,  '2026-09-05', 150),
(6,  '2026-09-06', 130),
(7,  '2026-09-07', 180),
(8,  '2026-09-08', 170),
(9,  '2026-09-09', 210),
(10, '2026-09-10', 205);
```


### 聚合统计

```sql
-- 1. 查询所有学生的平均分
SELECT AVG(score) FROM score;

-- 2. 查询每门课程的平均分
SELECT course_name, AVG(score) 
FROM score, course 
WHERE score.course_id = course.id
GROUP BY course_id

-- 3. 查询每门课程最高分、最低分、平均分
SELECT course_name, MAX(score) max_score, MIN(score) min_score, AVG(score) avg_score
FROM score, course 
WHERE score.course_id = course.id
GROUP BY course_id

-- 4. 查询每门课程参加考试的人数
SELECT course_name, COUNT(course_name)
FROM score, course
WHERE score.course_id = course.id
GROUP BY course_id

-- 5. 查询平均分大于 80 的课程
SELECT course_name
FROM score, course
WHERE score.course_id = course.id
GROUP BY course_id
HAVING AVG(score) > 80

-- 6. 查询参加考试人数大于 8 人的课程
SELECT course_name
FROM score, course
WHERE score.course_id = course.id
GROUP BY course_id
HAVING COUNT(student_id) > 8
```

### 多表 `JOIN`

- `INNER JOIN` 内联结

  只返回两个表中都匹配的行，相当于取两表的"交集"。不匹配的行会被直接过滤掉，结果集中不会出现 NULL 值。

- `LEFT JOIN` 左联结，也可以写为 `LEFT OUTER JOIN` 

  返回左表的所有行，右表有匹配的则显示对应数据，无匹配的则右表字段填充 NULL。

  > 在使用 OUTER JOIN 语法时，必须使用 RIGHT 或 LEFT 关键字指定包括其所有行的表（RIGHT 指出的是 OUTER JOIN 右边的表，而LEFT 指出的是 OUTER JOIN 左边的表）。

- `IS NULL`

  这是一个条件判断表达式，用来筛选某个字段值为 NULL 的行。它最常和 `LEFT JOIN` 搭配使用，用来查找"不存在"的数据。

```sql
-- 7. 查询所有学生姓名、课程名、成绩
-- 写法1：
SELECT `name`, course_name, score
FROM student, score, course
WHERE student.id = score.student_id AND course.id = score.course_id
-- 写法2：
SELECT `name`, course_name, score
FROM student
INNER JOIN score ON student.id = score.student_id
INNER JOIN course ON course.id = score.course_id

-- 8. 查询张三所有课程成绩
SELECT course_name, score
FROM student
INNER JOIN score ON student.id = score.student_id
INNER JOIN course ON course.id = score.course_id
WHERE `name` = '张三';

-- 9. 查询所有学生及其成绩，包括没有成绩的学生
SELECT `name`, course_name, score
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
LEFT OUTER JOIN course ON course.id = score.course_id

-- 10. 查询没有参加任何考试的学生
SELECT `name`
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
WHERE score.score IS NULL;

-- 11. 查询没有任何考试记录的课程
SELECT course_name
FROM course
LEFT OUTER JOIN score ON course.id = score.course_id
WHERE score.score IS NULL;

-- 12. 查询只参加了一门考试的学生
SELECT `name`
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
GROUP BY student.id
HAVING COUNT(score.course_id) = 1;
```

### 子查询 / `EXISTS` / `NOT EXISTS`

- `=`、`>`、`<`

  这三个是标量比较运算符，只能配合返回单行单列的子查询使用。

  ```sql
  -- 正确：子查询只返回一个值
  SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);
  -- 报错：子查询返回多行
  SELECT * FROM employees WHERE salary > (SELECT salary FROM employees WHERE dept = 'IT');
  ```

  如果子查询返回多行，数据库会直接报错。这时就需要引入 `ANY` 或 `ALL`。

- `IN` 判断左侧值是否存在于子查询返回的结果集中，等价于多个 `OR` 的组合。

  ```sql
  SELECT * FROM employees WHERE dept_id IN (SELECT dept_id FROM departments WHERE location = 'Beijing');
  -- 等价于
  SELECT * FROM employees WHERE dept_id = ANY (SELECT dept_id FROM departments WHERE location = 'Beijing');
  ```

  注：`NOT IN` 遇到子查询结果含 `NULL` 时，整个条件会失效返回空集，安全做法是在子查询中加 `IS NOT NULL` 过滤或改用 `NOT EXISTS`。

- `ANY` 必须紧跟在比较运算符后面使用，表示与子查询返回的任意一个值满足条件即为 `TRUE`（逻辑类似 `OR`）。

  ```sql
  -- 薪资高于至少一个 IT 部门员工
  SELECT * FROM employees WHERE salary > ANY (SELECT salary FROM employees WHERE dept = 'IT');
  ```

  不同运算符 + `ANY` 的等价转换：

  | 写法          | 等价于        | 含义             |
  | ------------- | ------------- | ---------------- |
  | `= ANY(...)`  | `IN(...)`     | 等于其中任意一个 |
  | `> ANY(...)`  | `> MIN(...)`  | 大于最小值       |
  | `< ANY(...)`  | `< MAX(...)`  | 小于最大值       |
  | `>= ANY(...)` | `>= MIN(...)` | 大于等于最小值   |
  | `<= ANY(...)` | `<= MAX(...)` | 小于等于最大值   |

- `ALL` 同样必须紧跟在比较运算符后面使用，表示与子查询返回的每一个值都满足条件才为 `TRUE`（逻辑类似 `AND`）。

  ```sql
  -- 薪资高于所有 IT 部门员工（即高于 IT 最高薪）
  SELECT * FROM employees WHERE salary > ALL (SELECT salary FROM employees WHERE dept = 'IT');
  ```

  不同运算符 + `ALL` 的等价转换如下所示：

  | 写法          | 等价于        | 含义           |
  | ------------- | ------------- | -------------- |
  | `<> ALL(...)` | `NOT IN(...)` | 不等于任何一个 |
  | `> ALL(...)`  | `> MAX(...)`  | 大于最大值     |
  | `< ALL(...)`  | `< MIN(...)`  | 小于最小值     |
  | `>= ALL(...)` | `>= MAX(...)` | 大于等于最大值 |
  | `<= ALL(...)` | `<= MIN(...)` | 小于等于最小值 |

`EXISTS` 和 `NOT EXISTS` 它们不关心子查询返回什么值，只判断子查询是否返回了至少一行记录，返回布尔值 `TRUE` 或 `FALSE`。

```sql
-- 查出所有下过订单的客户
SELECT c.customer_name
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
);

-- 查出所有没下过订单的客户
SELECT c.customer_name
FROM customers c
WHERE NOT EXISTS (
    SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id
);
```

示例如下：

```sql
-- 13. 查询成绩高于全校平均分的学生成绩
SELECT `name`, score.score
FROM student, score
WHERE score.score > (SELECT AVG(score) FROM score)

-- 14. 查询数学成绩高于数学平均分的学生
SELECT `name`
FROM student
WHERE id IN (
	SELECT student_id
	FROM score
	WHERE course_id = 102 AND score > (
		SELECT AVG(score)
		FROM score
		WHERE course_id = 102
	)
)

-- 15. 查询至少参加过一次考试的学生
SELECT `name`
FROM student
WHERE id IN (
	SELECT student_id
	FROM score
	GROUP BY student_id
	HAVING COUNT(score) >= 1
)

-- 16. 查询从未参加考试的学生
SELECT student.name
FROM student
LEFT OUTER JOIN score ON student.id = score.student_id
GROUP BY student.id, student.name
HAVING COUNT(score.course_id) < 1


-- 17. 查询同时参加语文和数学考试的学生
SELECT s.name
FROM student s
INNER JOIN score sc ON s.id = sc.student_id
WHERE sc.course_id IN (101, 102)
GROUP BY s.id, s.name
HAVING COUNT(DISTINCT sc.course_id) = 2;
```

### `CASE THEN`

```sql
SELECT   
	xx
	xx
	xx
    CASE
        WHEN ... THEN ...
        THEN ... THEN ...
        ELSE ... THEN ...
    END AS 'xx'
FROM xx
```

示例如下：

```sql
-- 18. 统计每门课程及格人数
SELECT c.course_name, COUNT(*) AS pass_count
FROM score s
INNER JOIN course c ON s.course_id = c.id
WHERE s.score >= 60
GROUP BY c.id

-- 19. 统计每门课程不及格人数
SELECT course_name, COUNT(*) AS no_pass_count
FROM score
INNER JOIN course ON score.course_id = course.id
WHERE score.score < 60
GROUP BY course.id

-- 20. 同时查询：
--     课程
--     总人数
--     及格人数
--     不及格人数
SELECT 
    c.course_name,
    COUNT(*) AS total_count,
    COUNT(CASE WHEN s.score >= 60 THEN 1 END) AS pass_count,
    COUNT(CASE WHEN s.score < 60 THEN 1 END) AS no_pass_count
FROM score s
INNER JOIN course c ON s.course_id = c.id
GROUP BY c.id, c.course_name;


-- 21. 将成绩划分：
--     >= 90       优秀
--     80~89       良好
--     60~79       及格
--     < 60        不及格
SELECT 
    s.id,
    s.student_id,
    s.course_id,
    s.score,
    CASE
        WHEN s.score >= 90 THEN '优秀'
        WHEN s.score >= 80 THEN '良好'
        WHEN s.score >= 60 THEN '及格'
        ELSE '不及格'
    END AS grade
FROM score s;
	

-- 22. 统计每门课程各成绩等级人数
SELECT 
	c.course_name,
	SUM(CASE WHEN s.score >= 90 THEN 1 ELSE 0 END) AS '优秀',
	SUM(CASE WHEN s.score < 90 AND s.score >= 80 THEN 1 ELSE 0 END) AS '良好',
	SUM(CASE WHEN s.score < 80 AND s.score >= 60 THEN 1 ELSE 0 END) AS '及格',
	SUM(CASE WHEN s.score < 60 THEN 1 ELSE 0 END) AS '不及格'
FROM score s
INNER JOIN course c ON s.course_id = c.id
GROUP BY c.id, c.course_name;
```

### 最大值 / 第二大值 / 第 N 大值

注意：

- `ROW_NUMBER` 不管成绩是否相同，每一行都给唯一编号

  ```
  95 -> 1
  95 -> 2
  90 -> 3
  80 -> 4
  ```

- `RANK` 相同值排名相同，但后面的名次会跳号

  ```
  95 -> 1
  95 -> 1
  90 -> 3
  80 -> 4
  ```

- `DENSE_RANK` 相同值排名相同，但后面的名次不跳号

  ```
  95 -> 1
  95 -> 1
  90 -> 2
  80 -> 3
  ```

示例如下：

```sql
-- 23. 查询全校最高成绩
SELECT MAX(score)
FROM score

-- 24. 查询全校第二高成绩
SELECT score
FROM (
	SELECT 
		score,
		DENSE_RANK() OVER (ORDER BY score DESC) AS rk
	FROM score
) t
WHERE rk = 2;

-- 25. 查询数学第二高成绩
SELECT score
FROM (
	SELECT 
		score,
		DENSE_RANK() OVER (ORDER BY score DESC) AS rk
	FROM score
	WHERE score.course_id = 102 
) t
WHERE rk = 2;

-- 26. 查询每门课程最高成绩
SELECT course_name, MAX(score) AS max_score
FROM score
INNER JOIN course ON score.course_id = course.id
GROUP BY course_id, course_name

-- 27. 查询每门课程最高成绩对应的学生
SELECT course_name, score, `name`
FROM (
    SELECT 
        c.course_name,
        s.score,
        st.name,
        DENSE_RANK() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
    FROM score s
    INNER JOIN course c ON s.course_id = c.id
    INNER JOIN student st ON s.student_id = st.id
) t
WHERE rk = 1;


-- 28. 查询每门课程第二高成绩对应的学生
SELECT course_name, score, `name`
FROM (
	SELECT 
		c.course_name,
		s.score,
		st.name,
		DENSE_RANK() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
	FROM score s
	INNER JOIN course c ON s.course_id = c.id
	INNER JOIN student st ON s.student_id = st.id
) t
WHERE rk = 2;
```

#### Top N

```sql
-- 29. 查询每门课程第一名
SELECT course_name, `name` AS `first`
FROM (
	SELECT
		c.course_name,
		st.name,
		ROW_NUMBER() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
	FROM score s
	INNER JOIN course c ON s.course_id = c.id
	INNER JOIN student st ON s.student_id = st.id 
) t
WHERE rk = 1;

-- 30. 查询每门课程前两名
SELECT course_name, `name`
FROM (
	SELECT
		c.course_name,
		st.name,
		ROW_NUMBER() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
	FROM score s
	INNER JOIN course c ON s.course_id = c.id
	INNER JOIN student st ON s.student_id = st.id 
) t
WHERE rk <= 2;

-- 31. 查询每门课程前三名
SELECT course_name, `name`
FROM (
	SELECT
		c.course_name,
		st.name,
		ROW_NUMBER() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
	FROM score s
	INNER JOIN course c ON s.course_id = c.id
	INNER JOIN student st ON s.student_id = st.id 
) t
WHERE rk <= 3;

-- 32. 出现并列时，只保留严格3个人
SELECT course_name, `name`
FROM (
	SELECT
		c.course_name,
		st.name,
		ROW_NUMBER() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
	FROM score s
	INNER JOIN course c ON s.course_id = c.id
	INNER JOIN student st ON s.student_id = st.id 
) t
WHERE rk <= 3;

-- 33. 出现并列时，按照成绩名次取前三名
SELECT course_name, `name`
FROM (
	SELECT
		c.course_name,
		st.name,
		DENSE_RANK() OVER (PARTITION BY s.course_id ORDER BY s.score DESC) AS rk
	FROM score s
	INNER JOIN course c ON s.course_id = c.id
	INNER JOIN student st ON s.student_id = st.id 
) t
WHERE rk <= 3;
```

### 重复数据

```sql
-- 34. 查询重复的 username
SELECT username
FROM user_account
GROUP BY username
HAVING COUNT(*) > 1;

-- 35. 查询重复的 email
SELECT email
FROM user_account
GROUP BY email
HAVING COUNT(*) > 1;

-- 36. 查询重复的 phone
SELECT phone
FROM user_account
GROUP BY phone
HAVING COUNT(*) > 1;

-- 37. 查询所有重复 username 对应的完整用户信息
SELECT *
FROM user_account
WHERE username IN (
	SELECT username
	FROM user_account
	GROUP BY username
	HAVING COUNT(*) > 1
);

-- 38. 删除重复 username，
--     每组只保留 id 最小的一条
-- 第一步：开启事务
START TRANSACTION;

-- 第二步：执行删除（注意末尾加分号）
DELETE FROM user_account
WHERE id NOT IN (
    SELECT id FROM (
        SELECT MIN(id) AS id
        FROM user_account
        GROUP BY username
    ) t
);

-- 第三步：验证删除结果
SELECT * FROM user_account;

-- 第四步：确认无误后提交，或回滚恢复
ROLLBACK;
```

### `LAG` / `LEAD`

LAG() 和 LEAD() 是 SQL 窗口函数中的“偏移函数”，用于在不使用自连接的情况下，直接获取当前行之前或之后指定行的数据。

```sql
LAG(列名, 偏移量, 默认值) OVER (PARTITION BY 分组字段 ORDER BY 排序字段)
LEAD(列名, 偏移量, 默认值) OVER (PARTITION BY 分组字段 ORDER BY 排序字段)
```

三个参数：

- 列名：要取值的列
- 偏移量：往前/往后几行（默认 1）
- 默认值：超出范围时返回什么（默认 NULL）

示例如下：

```sql
-- 39. 查询每天及前一天销售额
SELECT 
	amount, 
	LAG(amount, 1, 0) OVER (ORDER BY sale_date) AS pre_sale
FROM daily_sales

-- 40. 查询销售额高于前一天的日期
SELECT sale_date
FROM (
    SELECT 
        sale_date,
        amount,
        LAG(amount, 1, 0) OVER (ORDER BY sale_date) AS prev_amount
    FROM daily_sales
) t
WHERE amount > prev_amount;	

-- 41. 查询销售额低于前一天的日期
SELECT sale_date
FROM (
    SELECT 
        sale_date,
        amount,
        LAG(amount, 1, 0) OVER (ORDER BY sale_date) AS prev_amount
    FROM daily_sales
) t
WHERE amount < prev_amount;

-- 42. 查询每天相比前一天增加/减少多少钱
SELECT (amount - prev_amount)
FROM (
    SELECT 
        sale_date,
        amount,
        LAG(amount, 1, 0) OVER (ORDER BY sale_date) AS prev_amount
    FROM daily_sales
) t;

-- 43. 查询每天及下一天销售额
SELECT 
	sale_date,
	amount,
	LEAD(amount, 1, 0) OVER (ORDER BY sale_date) AS next_amount
FROM daily_sales
```

### 累计统计

示例如下：

```sql
-- 44. 查询每天累计销售额
SELECT 
	sale_date,
	amount,
	SUM(amount) OVER (ORDER BY sale_date) cumulative_sales
FROM daily_sales

-- 45. 查询每天之前所有日期的平均销售额
SELECT 
    sale_date,
    amount,
    AVG(amount) OVER (
        ORDER BY sale_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS avg_sales_to_date
FROM daily_sales;

-- 46. 查询最近3天移动平均销售额
SELECT
	sale_date,
	amount,
	AVG(amount) OVER (
		ORDER BY sale_date
		ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
	) AS avg_sales_least_three_day
FROM daily_sales;
```

### 连续登录

示例如下：

```sql
-- 47. 查询连续登录至少2天的用户
SELECT DISTINCT user_id
FROM (
    SELECT
        user_id,
        login_date,
        DATE_SUB(
            login_date,
            INTERVAL ROW_NUMBER() OVER (
                PARTITION BY user_id
                ORDER BY login_date
            ) DAY
        ) AS group_date
    FROM login_record
) t
GROUP BY user_id, group_date
HAVING COUNT(*) >= 2;

-- 48. 查询连续登录至少3天的用户
SELECT DISTINCT user_id
FROM (
    SELECT
        user_id,
        login_date,
        DATE_SUB(
            login_date,
            INTERVAL ROW_NUMBER() OVER (
                PARTITION BY user_id
                ORDER BY login_date
            ) DAY
        ) AS group_date
    FROM login_record
) t
GROUP BY user_id, group_date
HAVING COUNT(*) >= 3;

-- 49. 查询每个用户每次登录距离上一次登录多少天
SELECT
    user_id,
    login_date,
    prev_login_date,
    DATEDIFF(login_date, prev_login_date) AS diff_days
FROM (
    SELECT
        user_id,
        login_date,
        LAG(login_date) OVER (
            PARTITION BY user_id
            ORDER BY login_date
        ) AS prev_login_date
    FROM login_record
) t;

-- 50. 查询每个用户最长连续登录天数
SELECT
    user_id,
    MAX(continuous_days) AS max_continuous_days
FROM (
    SELECT
        user_id,
        group_date,
        COUNT(*) AS continuous_days
    FROM (
        SELECT
            user_id,
            login_date,
            DATE_SUB(
                login_date,
                INTERVAL ROW_NUMBER() OVER (
                    PARTITION BY user_id
                    ORDER BY login_date
                ) DAY
            ) AS group_date
        FROM login_record
    ) t1
    GROUP BY user_id, group_date
) t2
GROUP BY user_id;
```
