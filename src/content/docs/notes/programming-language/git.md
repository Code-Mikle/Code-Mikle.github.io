---
title: Git
---

1. 创建分支

   ```bash
   git branch <branch-name>
   ```

2. 切换到新分支

   ```bash
   git checkout <branch-name>
   // 或者
   git switch <branch-name>
   ```

3. 将更改提交到分支

   ```bash
   git add .
   git commit -m "your commit message"
   ```

4. 将分支推送到远程仓库

   ```bash
   git push origin <branch-name>
   ```

5. 合并分支

   先切换回你想要合并到的主分支（通常是 main 或 master），然后执行合并命令

   ```bash
   git checkout main
   git merge <branch-name>
   // 或者
   git switch main
   git merge <branch-name>
   ```

6. 删除分支

   当分支完成任务后，可以删除本地或远程分支

   ```bash
   git branch -d <branch-name>  # 本地删除
   git push origin --delete <branch-name>  # 远程删除
   ```

7. 打标签

   ```bash
   git tag -a v1.0 -m "Version 1.0"
   git push origin v1.0
   ```





**`.gitkeep` 文件**

因为 git 追踪的是文件的变更，而不是文件夹。那么如果你创建一个空文件夹（不放入任何文件），`git add` 时 git 是不会追踪该空文件夹的。但是在一些场景下你需要添加一些空文件夹，例如：

```
logs/           ← 日志目录，初始为空，但希望 clone 后就存在
uploads/        ← 上传文件目录
tmp/            ← 临时文件目录
```

这时候在空目录里放一个 `.gitkeep` 文件，Git 就会追踪这个目录了。






待添加：

git pull 拉取最新修改

git log 查看提交历史

解决冲突

git remote cha'kan
