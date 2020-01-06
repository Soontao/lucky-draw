<template>
  <div id="tool">
    <el-button @click="startHandler" type="primary" size="mini">
      {{
      running ? '停止' : '开始'
      }}
    </el-button>
    <el-button size="mini" @click="resetConfig">重置</el-button>
    <el-button size="mini" @click="showImport = true">导入</el-button>
    <!-- <el-button size="mini" @click="showImportphoto = true">
      导入照片
    </el-button>-->
    <el-button size="mini" @click="exportCsv">导出</el-button>

    <el-dialog
      :append-to-body="true"
      :visible.sync="showSetwat"
      class="setwat-dialog"
      width="400px"
    >
      <el-form ref="form" :model="form" label-width="80px" size="mini">
        <el-form-item label="抽取奖项">
          <el-select v-model="form.category" placeholder="请选取本次抽取的奖项">
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in categorys"
              :key="index"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label=" " v-if="form.category">
          <span>
            共&nbsp;
            <span class="colorred">{{ config[form.category] }}</span>
            &nbsp;名
          </span>
          <span :style="{ marginLeft: '20px' }">
            剩余&nbsp;
            <span class="colorred">{{ remain }}</span>
            &nbsp;名
          </span>
        </el-form-item>

        <el-form-item label="抽取方式">
          <el-select v-model="form.mode" placeholder="请选取本次抽取方式">
            <el-option label="抽1人" :value="1"></el-option>
            <el-option label="抽5人" :value="5"></el-option>
            <el-option label="一次抽取完" :value="0"></el-option>
            <el-option label="自定义" :value="99"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="抽取人数" v-if="form.mode === 99">
          <el-input
            v-model="form.qty"
            type="number"
            :clearable="true"
            :min="1"
            :max="remain ? remain : 100"
            :step="1"
          ></el-input>
        </el-form-item>

        <el-form-item label="全员参与">
          <el-switch v-model="form.allin"></el-switch>
          <span :style="{ fontSize: '12px' }">(开启后将在全体成员[无论有无中奖]中抽奖)</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">立即抽奖</el-button>
          <el-button @click="showSetwat = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog
      :append-to-body="true"
      :visible.sync="showImport"
      class="import-dialog"
      width="400px"
    >
      <el-input
        type="textarea"
        :rows="10"
        placeholder="请输入对应的号码和名单(可直接从excel复制)

格式(ID\t名字)，如：

I000000	xiang, C 
I000001	zhao, W
I000002	zhang, X
				"
        v-model="listStr"
      ></el-input>
      <div class="footer">
        <el-button size="mini" type="primary" @click="transformList">确定</el-button>
        <el-button size="mini" @click="showImport = false">取消</el-button>
      </div>
    </el-dialog>
    <Importphoto :visible.sync="showImportphoto" @getPhoto="$emit('getPhoto')"></Importphoto>
  </div>
</template>

<script>
import { clearData, conversionCategoryName } from '@/helper/index';
import Importphoto from './Importphoto';
import { database, DB_STORE_NAME } from '@/helper/db';
import { ExportToCsv } from 'export-to-csv';

export default {
  props: {
    running: Boolean,
    closeRes: Function
  },
  computed: {
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    remain() {
      return (
        this.config[this.form.category] -
        (this.result[this.form.category]
          ? this.result[this.form.category].length
          : 0)
      );
    },
    result() {
      return this.$store.state.result;
    },
    categorys() {
      const options = [];
      for (const key in this.config) {
        if (this.config.hasOwnProperty(key)) {
          const item = this.config[key];
          if (item > 0) {
            let name = conversionCategoryName(key);
            name &&
              options.push({
                label: name,
                value: key
              });
          }
        }
      }
      return options;
    }
  },
  components: { Importphoto },
  data() {
    return {
      showSetwat: false,
      showImport: false,
      showImportphoto: false,
      form: {
        category: '',
        mode: 1,
        qty: 1,
        allin: false
      },
      listStr: ''
    };
  },
  methods: {
    exportCsv() {
      const state = this.$store.state;
      const { list, result, newLottery } = state;
      let data = [];
      Object.keys(result).forEach(k => {
        const v = result[k];
        const aName = newLottery.find(v => v.key == k).name;
        if (v) {
          data = data.concat(
            v.map(v => {
              const mapping = list.find(i => i.key == v);
              if (mapping) {
                return { award: aName, person: mapping.name };
              } else {
                return { award: aName, person: v };
              }
            })
          );
        }
      });
      if (data && data.length > 0) {
        new ExportToCsv({
          headers: ['Award', 'Person'],
          showLabels: true,
          showTitle: false,
          filename: 'Lucky List'
        }).generateCsv(data);
      } else {
        this.$message({
          type: 'info',
          message: '没有信息可以导出'
        });
      }
    },
    resetConfig() {
      this.$confirm('此操作将重置所有数据，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          clearData();
          this.$store.commit('setClearStore');
          database.clear(DB_STORE_NAME);
          this.closeRes && this.closeRes();
          this.$message({
            type: 'success',
            message: '重置成功!'
          });

          this.$nextTick(() => {
            this.$emit('resetConfig');
          });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    },
    onSubmit() {
      if (!this.form.category) {
        return this.$message.error('请选择本次抽取的奖项');
      }
      if (this.remain <= 0) {
        return this.$message.error('该奖项剩余人数不足');
      }
      if (this.form.mode === 99) {
        if (this.form.qty <= 0) {
          return this.$message.error('必须输入本次抽取人数');
        }
        if (this.form.qty > this.remain) {
          return this.$message.error('本次抽奖人数已超过本奖项的剩余人数');
        }
      }
      if (this.form.mode === 1 || this.form.mode === 5) {
        if (this.form.mode > this.remain) {
          return this.$message.error('本次抽奖人数已超过本奖项的剩余人数');
        }
      }
      this.showSetwat = false;
      this.$emit(
        'toggle',
        Object.assign({}, this.form, { remain: this.remain })
      );
    },
    startHandler() {
      this.$emit('toggle');
      if (!this.running) {
        this.showSetwat = true;
      }
    },
    transformList() {
      const { listStr } = this;
      if (!listStr) {
        this.$message.error('没有数据');
      }
      const list = [];
      const rows = listStr.trim().split('\n');

      rows.forEach((r, id) => {
        var item = r.trim();
        if (item) {
          const key = id + 1;
          const rowList = item.split(/\t/);
          const uid = rowList[0].trim();
          const uname = rowList[1].trim();
          const name = `${uid}-(${uname})`;
          list.push({
            key,
            name,
            uid,
            uname
          });
        }
      });

      this.$store.commit('setList', list);

      this.$message({
        message: '保存成功',
        type: 'success'
      });
      this.showImport = false;
      this.$nextTick(() => {
        this.$emit('resetConfig');
      });
    }
  }
};
</script>
<style lang="scss">
#tool {
  position: fixed;
  width: 60px;
  height: 500px;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .el-button + .el-button {
    margin-top: 20px;
    margin-left: 0px;
  }
}
.setwat-dialog {
  .colorred {
    color: red;
    font-weight: bold;
  }
}
.import-dialog {
  .footer {
    height: 50px;
    line-height: 50px;
    text-align: center;
  }
}
</style>
